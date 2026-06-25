/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap'
import '../globals.css'
import '@payloadcms/next/css'
import './admin-theme.css'

type Args = {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'ExcelENT Admin',
  description: 'ExcelENT Medical CMS Admin Panel',
}

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
