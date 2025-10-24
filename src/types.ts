export interface Persona {
  _id?: string;
  name: string;
  avatar?: string;
  traits: string[];
  speaking_style?: string;
  emotional_baseline?: { valence:number; arousal:number; dominance:number };
  prompt_template: string;
  plugins_allowed?: string[];
}

export interface TemplateEdit {
  _id?: string;
  session_id?: string;
  persona_id: string;
  before: string;
  after: string;
  diff?: string;
  reason?: string;
  risk_level?: 'low'|'medium'|'high';
  status?: 'pending'|'approved'|'rejected';
  created_at?: string;
}

export interface VAD { valence:number; arousal:number; dominance:number; }

export interface PluginManifest {
  name: string; displayName: string; version: string; permissions?: string[];
}
