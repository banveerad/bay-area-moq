import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import type { ResourceRow } from "@/lib/resources";

export const Route = createFileRoute("/_authenticated/admin/resources")({
  head: () => ({
    meta: [
      { title: "Manage Resources — Bay Area MoQ" },
      {
        name: "description",
        content: "Add, edit and remove the specs, repos and talks listed on the Resources page.",
      },
      { property: "og:title", content: "Manage Resources — Bay Area MoQ" },
      {
        property: "og:description",
        content: "Organiser tool for curating the Bay Area MoQ reading list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminResourcesPage,
});

type FormState = {
  section: string;
  label: string;
  href: string;
  note: string;
  sort_order: string;
};

const emptyForm: FormState = { section: "", label: "", href: "", note: "", sort_order: "0" };

function AdminResourcesPage() {
  const { isAdmin, loading } = useIsAdmin();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const { data: resources } = useQuery({
    queryKey: ["resources"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ResourceRow[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["resources"] });
  };

  const toPayload = (form: FormState) => ({
    section: form.section.trim(),
    label: form.label.trim(),
    href: form.href.trim(),
    note: form.note.trim(),
    sort_order: Number.parseInt(form.sort_order, 10) || 0,
  });

  const createResource = useMutation({
    mutationFn: async (form: FormState) => {
      const { error } = await supabase.from("resources").insert(toPayload(form));
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource added.");
      setCreateForm(emptyForm);
      setShowCreate(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: FormState }) => {
      const { error } = await supabase.from("resources").update(toPayload(form)).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource updated.");
      setEditingId(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resource removed.");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) {
    return <p className="mx-auto max-w-3xl px-5 py-20 text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-3xl">Page not found</h1>
      </div>
    );
  }

  const sections = Array.from(new Set((resources ?? []).map((r) => r.section)));

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <Link to="/admin" className="text-sm text-ember">
        ← Organiser tools
      </Link>
      <p className="mt-6 font-display text-xs uppercase tracking-widest text-ember">
        Reading list
      </p>
      <h1 className="mt-3 font-display text-3xl tracking-tight">Manage resources</h1>
      <p className="mt-3 text-muted-foreground">
        Everything here shows up on the public Resources page, grouped by section and ordered by
        the sort number (lowest first).
      </p>

      <button
        type="button"
        onClick={() => setShowCreate((v) => !v)}
        className="mt-8 border border-ember bg-ember px-5 py-2.5 font-display text-xs uppercase tracking-widest text-background transition-colors hover:bg-transparent hover:text-ember"
      >
        {showCreate ? "× Cancel" : "+ Add resource"}
      </button>

      {showCreate ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createResource.mutate(createForm);
          }}
          className="mt-6 space-y-4 border border-border bg-card p-6"
        >
          <ResourceFields form={createForm} setForm={setCreateForm} sections={sections} />
          <button
            type="submit"
            disabled={createResource.isPending}
            className="border border-ember bg-ember px-5 py-2.5 font-display text-xs uppercase tracking-widest text-background disabled:opacity-50"
          >
            {createResource.isPending ? "Saving…" : "Save resource"}
          </button>
        </form>
      ) : null}

      <div className="mt-12 space-y-10">
        {(resources ?? []).length === 0 ? (
          <p className="text-muted-foreground">No resources yet. Add the first one above.</p>
        ) : null}

        {sections.map((section) => (
          <section key={section}>
            <h2 className="border-b border-border pb-3 font-display text-lg tracking-tight">
              {section}
            </h2>
            <ul className="mt-4 space-y-3">
              {(resources ?? [])
                .filter((r) => r.section === section)
                .map((item) => (
                  <li key={item.id} className="border border-border bg-card p-5">
                    {editingId === item.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateResource.mutate({ id: item.id, form: editForm });
                        }}
                        className="space-y-4"
                      >
                        <ResourceFields form={editForm} setForm={setEditForm} sections={sections} />
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={updateResource.isPending}
                            className="border border-ember bg-ember px-4 py-2 font-display text-xs uppercase tracking-widest text-background disabled:opacity-50"
                          >
                            {updateResource.isPending ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="border border-border px-4 py-2 font-display text-xs uppercase tracking-widest text-muted-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-display text-sm">{item.label}</p>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block break-all text-xs text-ember"
                          >
                            {item.href}
                          </a>
                          {item.note ? (
                            <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Sort order: {item.sort_order}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditForm({
                                section: item.section,
                                label: item.label,
                                href: item.href,
                                note: item.note ?? "",
                                sort_order: String(item.sort_order),
                              });
                            }}
                            className="border border-border px-4 py-2 font-display text-xs uppercase tracking-widest transition-colors hover:border-ember hover:text-ember"
                          >
                            ✎ Edit
                          </button>
                          <button
                            type="button"
                            disabled={deleteResource.isPending}
                            onClick={() => {
                              if (confirm(`Delete "${item.label}" from the resources page?`))
                                deleteResource.mutate(item.id);
                            }}
                            className="border border-destructive px-4 py-2 font-display text-xs uppercase tracking-widest text-destructive transition-colors hover:bg-destructive hover:text-background disabled:opacity-50"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ResourceFields({
  form,
  setForm,
  sections,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  sections: string[];
}) {
  const inputClass =
    "mt-2 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ember";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Section
          </span>
          <input
            required
            list="resource-sections"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
            placeholder="Specs & drafts"
            className={inputClass}
          />
          <datalist id="resource-sections">
            {sections.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm">
          <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Sort order
          </span>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Title
        </span>
        <input
          required
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="moq-transport draft"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Link
        </span>
        <input
          required
          type="url"
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
          placeholder="https://…"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Note
        </span>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
          maxLength={300}
          placeholder="One line on why it's worth opening."
          className={inputClass}
        />
      </label>
    </>
  );
}
