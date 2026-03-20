import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/email', async (req, res) => {
  try {
    const { companyWallet, employeeId, employeeWallet, employeeName, email } = req.body;

    if (!companyWallet || !employeeId || !employeeWallet || !employeeName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('employee_emails')
      .upsert(
        {
          company_wallet: companyWallet.toLowerCase(),
          employee_id: employeeId,
          employee_wallet: employeeWallet.toLowerCase(),
          employee_name: employeeName,
          email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'company_wallet,employee_id' }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to save employee email' });
  }
});

router.get('/email', async (req, res) => {
  try {
    const { companyWallet, employeeId } = req.query;

    if (!companyWallet || !employeeId) {
      return res.status(400).json({ error: 'companyWallet and employeeId are required' });
    }

    const { data, error } = await supabase
      .from('employee_emails')
      .select('*')
      .eq('company_wallet', String(companyWallet).toLowerCase())
      .eq('employee_id', Number(employeeId))
      .maybeSingle();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch employee email' });
  }
});

export default router;