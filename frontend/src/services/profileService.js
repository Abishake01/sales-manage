import { supabase } from './supabaseClient';

const TABLE = 'company_profiles';

const defaultProfile = {
  companyName: 'Your Company Name',
  address: 'Your Company Address',
  phone: '+91-XXXXXXXXXX',
  email: 'info@example.com',
  userProfile: '',
};

export async function getProfile(userId) {
  if (!supabase || !userId) return defaultProfile;
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('getProfile error', error.message);
    return defaultProfile;
  }

  return {
    companyName: data.company_name || defaultProfile.companyName,
    address: data.address || defaultProfile.address,
    phone: data.phone || defaultProfile.phone,
    email: data.email || defaultProfile.email,
    userProfile: data.user_profile || defaultProfile.userProfile,
  };
}

export async function upsertProfile(userId, profile) {
  if (!supabase || !userId) return { data: null, error: 'Supabase not configured' };
  const payload = {
    user_id: userId,
    company_name: profile.companyName || '',
    address: profile.address || '',
    phone: profile.phone || '',
    email: profile.email || '',
    user_profile: profile.userProfile || '',
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  return { data, error };
}

export { defaultProfile };
