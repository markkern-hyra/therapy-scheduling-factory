import { AppNav } from "@/app/_components/app-nav";
import { setInsuranceStatus } from "@/app/clients/actions";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Choice } from "@/components/ui/choice";
import { DescriptionList } from "@/components/ui/description-list";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth/require-role";
import { isStaff } from "@/lib/auth/roles";
import { cardFields, missingCardText } from "@/lib/scheduling/clients";
import { INSURANCE_CHOICES, insuranceLine } from "@/lib/scheduling/insurance";
import { messageFor } from "@/lib/scheduling/messages";

const BACK = { href: "/clients", label: "Clients" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Картка клієнта. Хто що бачить, вирішує RLS: admin і scheduler — усі картки (AC-CARD-10), терапевт — лише своїх
// клієнтів. Немає рядка — чужа, прострочена чи неіснуюча картка — лише текст за роллю, без даних (AC-CARD-05, 08, 14, 16).
export default async function ClientPage({ params, searchParams }: PageProps<"/clients/[id]">) {
  const { supabase, role, name } = await requireRole();
  const { id } = await params;
  const { data: client, error } = UUID.test(id)
    ? await supabase
        .from("clients")
        .select("full_name, kind, email, birth_date, language, guardian_name, guardian_email")
        .eq("id", id)
        .maybeSingle()
    : { data: null, error: null };
  if (error) throw new Error(error.message);

  const { data: insurance, error: insuranceError } = client
    ? await supabase.from("client_insurance").select("status").eq("client_id", id).maybeSingle()
    : { data: null, error: null };
  if (insuranceError) throw new Error(insuranceError.message);
  const query = await searchParams;
  const notice = query.notice === "INSURANCE_SAVED" ? messageFor("INSURANCE_SAVED") : undefined;
  const failure = messageFor(query.error);

  const fields = client && cardFields(client);
  return (
    <>
      <AppNav role={role} name={name} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        {client && fields ? (
          <>
            <PageHeader
              title={client.full_name}
              back={BACK}
              leading={<Avatar name={client.full_name} size="lg" />}
              description={
                <span className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{fields.type}</Badge>
                  {client.language && <Badge variant="neutral">{client.language}</Badge>}
                </span>
              }
            />
            <Card title="Intake">
              <DescriptionList
                items={[
                  { term: "Client type", detail: fields.type },
                  { term: "Date of birth", detail: fields.birthDate, numeric: true, muted: !client.birth_date },
                  { term: "Session language", detail: fields.language, muted: !client.language },
                  ...(client.kind === "child"
                    ? [
                        { term: "Guardian name", detail: client.guardian_name },
                        { term: "Guardian email", detail: client.guardian_email },
                      ]
                    : [{ term: "Email", detail: fields.contact }]),
                ]}
              />
            </Card>
            <Card title="Insurance">
              {notice && <Alert variant="success">{notice}</Alert>}
              {failure && <Alert>{failure}</Alert>}
              <p className="text-sm">{insuranceLine(insurance?.status ?? null)}</p>
              {isStaff(role) && (
                <form action={setInsuranceStatus} className="flex flex-col gap-3">
                  <input type="hidden" name="client_id" value={id} />
                  <fieldset className="flex flex-col gap-1">
                    <legend className="mb-1 text-sm font-medium">Insurance check</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {INSURANCE_CHOICES.map(({ value, label }) => (
                        <Choice key={value} name="status" value={value} defaultChecked={insurance?.status === value} required>
                          {label}
                        </Choice>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              )}
            </Card>
          </>
        ) : (
          <>
            <PageHeader title="Client" back={BACK} />
            <Alert>{missingCardText(role)}</Alert>
          </>
        )}
      </main>
    </>
  );
}
