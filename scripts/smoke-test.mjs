import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { displayToIso, isoToDisplay, prepareSubmitData, VALID_QUOTE_TYPES } from '../src/utils/format.js';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf-8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1] || '').trim();

let passed = 0;
let failed = 0;
const check = (name, ok) => {
  if (ok) { passed++; console.log('  OK  ', name); }
  else { failed++; console.log('  FAIL', name); }
};

console.log('Smoke tests\n');

check('VALID_QUOTE_TYPES includes auto', VALID_QUOTE_TYPES.includes('auto'));
check('displayToIso valid date', displayToIso('07/03/2026') === '2026-07-03');
check('displayToIso rejects invalid', displayToIso('02/29/2023') === '');
check('isoToDisplay roundtrip', isoToDisplay('2026-07-03') === '07/03/2026');
check('prepareSubmitData strips text field', !('policyEffectiveDateText' in prepareSubmitData({
  firstName: 'A', policyEffectiveDate: '2026-07-03',
})));

const url = get('VITE_SUPABASE_URL');
const key = get('VITE_SUPABASE_ANON_KEY');
if (url && key) {
  const supabase = createClient(url, key);
  const id = crypto.randomUUID();
  const payload = prepareSubmitData({
    firstName: 'Smoke',
    lastName: 'Test',
    phone: '5550009999',
    email: 'smoke@test.com',
    currentInsuranceCompany: 'GEICO',
    policyEffectiveDate: '2026-08-01',
  });
  const { error } = await supabase.from('leads').insert({
    id, type: 'cyber', status: 'complete', data: payload,
  });
  check('Supabase insert with new fields', !error);
  if (error) console.log('       ', error.message);
} else {
  console.log('  SKIP Supabase (no .env)');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
