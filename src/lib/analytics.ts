import { supabase } from "@/integrations/supabase/client";

export const trackEvent = async (eventName: string, metadata: any = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get or create session ID for anonymous tracking
  let sessionId = localStorage.getItem('mente_ativa_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mente_ativa_session_id', sessionId);
  }

  try {
    const { error } = await supabase.from('funnel_events').insert({
      event_name: eventName,
      session_id: sessionId,
      user_id: user?.id,
      metadata
    });
    
    if (error) console.error("Error tracking event:", error);
  } catch (err) {
    console.error("Tracking error:", err);
  }
};
