-- Allow employees to update their own record (for profile activation and self-edits)
CREATE POLICY "Employees can update their own record"
ON public.employees
FOR UPDATE
TO authenticated
USING (profile_id = auth.uid() AND business_id = get_user_business_id())
WITH CHECK (profile_id = auth.uid() AND business_id = get_user_business_id());
