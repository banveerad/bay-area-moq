import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { buildIcs } from "@/lib/calendar";

export const Route = createFileRoute("/api/public/calendar/$meetupId.ics")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const meetupId = (params as Record<string, string>)["meetupId.ics"]!.replace(
          /\.ics$/i,
          "",
        );
        if (!/^[0-9a-f-]{36}$/i.test(meetupId)) {
          return new Response("Not found", { status: 404 });
        }

        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
                h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data } = await supabasePublic
          .from("meetups")
          .select("title, event_date, time_label, venue, city, summary")
          .eq("id", meetupId)
          .maybeSingle();

        if (!data) return new Response("Not found", { status: 404 });

        const slug =
          data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "meetup";

        return new Response(buildIcs(data), {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="${slug}.ics"`,
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
