"use client"

import { useParams } from 'next/navigation'
import AdView from '@/components/ui/j_comp/AdView'

export default function AdViewPage() {
    const params = useParams()
    const adId = parseInt(params.id)

    const adData = {
        id: adId,
        name: `Ad ${adId}`,
        chartData: [
            { month: "Jan", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Feb", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Mar", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Apr", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "May", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
            { month: "Jun", desktop: Math.floor(Math.random() * 300) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
        ]
    }

    return <AdView adData={adData} />
}