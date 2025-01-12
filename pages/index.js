// pages/index.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '~/lib/supabaseClient'
import Link from 'next/link'
import Head from 'next/head'

export default function Home() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/auth',
      permanent: false
    }
  }
}
