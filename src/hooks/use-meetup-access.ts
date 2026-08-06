import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";

/**
 * Access model for organiser tools:
 * - admins can manage everything
 * - event managers can manage only the meetups they are assigned to
 */
export function useMeetupAccess() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const { data, isLoading } = useQuery({
    queryKey: ["managed-meetups", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetup_managers")
        .select("meetup_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((row) => row.meetup_id);
    },
  });

  const managedIds = data ?? [];
  const loading = adminLoading || (Boolean(user) && isLoading);

  return {
    isAdmin,
    managedIds,
    isManager: managedIds.length > 0,
    canManage: (meetupId: string) => isAdmin || managedIds.includes(meetupId),
    hasAccess: isAdmin || managedIds.length > 0,
    loading,
  };
}
