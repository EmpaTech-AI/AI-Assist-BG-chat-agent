import { AXEL_INSTRUCTIONS } from './instructions';

const { schedule_appointment_config, schedule_appointment } = require('../tools/schedule-appointment');
const { capture_lead_config, capture_lead } = require('../tools/capture-lead');
const { fetch_datetime_config, fetch_datetime } = require('../tools/fetch-datetime');

export const MODEL = 'gpt-4o';

export const INSTRUCTIONS = AXEL_INSTRUCTIONS;

// Vector store / files backing the assistant's knowledge base, mirrored
// from the live OpenAI assistant (asst_sKK9XbSbJIv7RvmluZUX6gLH). Both
// underlying .docx files were refreshed on 2026-07-27 to replace the
// deprecated Starter/Growth/Premium subscription tiers with the new
// 7-product AI transformation ecosystem (per AI_Assist_BG_KB_Update_Spec.md).
const VECTOR_STORE_ID = 'vs_67b87774c8c08191b32f58d89a3a70ba';
const CODE_INTERPRETER_FILE_IDS = ['file-Bbs9gFpPjUAhpu4Ti4yTEt', 'file-WVzWXPa4Un4in8aHKQgWwP'];

export const TOOLS = [
  { type: 'file_search', vector_store_ids: [VECTOR_STORE_ID] },
  { type: 'code_interpreter', container: { type: 'auto', file_ids: CODE_INTERPRETER_FILE_IDS } },
  schedule_appointment_config,
  capture_lead_config,
  fetch_datetime_config,
];

export const SUPPORTED_ACTIONS = {
  schedule_appointment,
  capture_lead,
  fetch_datetime,
};
