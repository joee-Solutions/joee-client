"use client";

import PatientStepper from '@/components/Org/Patients/PatientStepper'
import React from 'react'
import { useParams } from 'next/navigation'

export default function AddPatientPage() {
  const params = useParams();
  // The route is [tenant], so the param is 'tenant', not 'org'
  const tenant = params?.tenant as string || '';
  
  return (
    <PatientStepper slug={tenant} />
  )
}   