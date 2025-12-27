import { supabase } from './supabaseClient';

const toHeaderRow = (userId, form) => ({
  id: form.id || undefined,
  user_id: userId,
  enquiry_number: form.enquiryNumber || form.engagementNumber,
  enquiry_date: form.date,
  status: form.status || 'pending',
  incharge: form.incharge || '',
  validity_value: form.validityValue ? Number(form.validityValue) : null,
  validity_unit: form.validityUnit || 'days',
  customer_name: form.customer?.name || null,
  customer_address: form.customer?.address || null
});

const toItemRows = (enquiryId, items = []) =>
  items.map(i => ({
    enquiry_id: enquiryId,
    description: i.description || null,
    part_number: i.partNumber || null,
    made: i.made || null,
    quantity: i.quantity ? Number(i.quantity) : 0,
    uom: i.uom || null,
    unit_price: i.unitPrice ? Number(i.unitPrice) : 0,
    s_percent: i.sPercent ? Number(i.sPercent) : 0,
    sub_name: i.subName || null,
    sale_price: i.salePrice ? Number(i.salePrice) : null
  }));

export async function listEnquiries(userId) {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('user_id', userId)
    .order('enquiry_date', { ascending: false });
  if (error) throw new Error(error.message);

  const ids = data.map(d => d.id);
  if (ids.length === 0) return [];
  const { data: items, error: itemsErr } = await supabase
    .from('enquiry_items')
    .select('enquiry_id, quantity, unit_price, s_percent')
    .in('enquiry_id', ids);
  if (itemsErr) throw new Error(itemsErr.message);

  const totals = new Map();
  for (const it of items) {
    const total = (it.quantity || 0) * (it.unit_price || 0) * (1 - (it.s_percent || 0) / 100);
    totals.set(it.enquiry_id, (totals.get(it.enquiry_id) || 0) + total);
  }

  return data.map(d => ({
    id: d.id,
    enquiryNumber: d.enquiry_number,
    date: d.enquiry_date,
    customer: { name: d.customer_name },
    status: d.status,
    totalAmount: Number(totals.get(d.id) || 0)
  }));
}

export async function getEnquiryWithItems(id) {
  const { data: header, error: hErr } = await supabase
    .from('enquiries')
    .select('*').eq('id', id).single();
  if (hErr) throw new Error(hErr.message);

  const { data: items, error: iErr } = await supabase
    .from('enquiry_items')
    .select('*').eq('enquiry_id', id).order('id', { ascending: true });
  if (iErr) throw new Error(iErr.message);

  const totalAmount = items.reduce((sum, it) =>
    sum + (it.quantity || 0) * (it.unit_price || 0) * (1 - (it.s_percent || 0) / 100), 0);

  return {
    id: header.id,
    enquiryNumber: header.enquiry_number,
    date: header.enquiry_date,
    status: header.status,
    incharge: header.incharge,
    validityValue: header.validity_value,
    validityUnit: header.validity_unit,
    customer: { name: header.customer_name, address: header.customer_address },
    items: items.map(it => ({
      description: it.description,
      partNumber: it.part_number,
      made: it.made,
      quantity: it.quantity,
      uom: it.uom,
      unitPrice: it.unit_price,
      sPercent: it.s_percent,
      subName: it.sub_name,
      salePrice: it.sale_price
    })),
    totalAmount
  };
}

export async function upsertEnquiry(userId, form) {
  const headerRow = toHeaderRow(userId, form);
  let headerId = form.id;

  if (headerId) {
    const { error } = await supabase
      .from('enquiries')
      .update(headerRow)
      .eq('id', headerId);
    if (error) throw new Error(error.message);
    const { error: delErr } = await supabase
      .from('enquiry_items')
      .delete()
      .eq('enquiry_id', headerId);
    if (delErr) throw new Error(delErr.message);
  } else {
    const { data, error } = await supabase
      .from('enquiries')
      .insert(headerRow)
      .select().single();
    if (error) throw new Error(error.message);
    headerId = data.id;
  }

  const itemsRows = toItemRows(headerId, form.items);
  if (itemsRows.length > 0) {
    const { error: insErr } = await supabase.from('enquiry_items').insert(itemsRows);
    if (insErr) throw new Error(insErr.message);
  }

  return headerId;
}

export async function deleteEnquiry(userId, id) {
  const { error: iErr } = await supabase.from('enquiry_items').delete().eq('enquiry_id', id);
  if (iErr) throw new Error(iErr.message);
  const { error: hErr } = await supabase.from('enquiries').delete().eq('id', id);
  if (hErr) throw new Error(hErr.message);
}
