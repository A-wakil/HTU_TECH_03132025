"use client"

import { useRouter } from "next/navigation";
import "./AdCard.css"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

function AdCard({ name, chartData }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/ad-view/${name}`);
    };

    return(
        <div className="ad-card" onClick={handleClick}>
            <div className="chart-container">
                <ChartContainer config={chartConfig}>
                    <BarChart 
                        width={150}
                        height={100}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 5,
                            left: 5,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar 
                            dataKey="desktop" 
                            fill="hsl(var(--chart-1))" 
                            radius={[2, 2, 0, 0]} 
                        />
                        <Bar 
                            dataKey="mobile" 
                            fill="hsl(var(--chart-2))" 
                            radius={[2, 2, 0, 0]} 
                        />
                    </BarChart>
                </ChartContainer>
            </div>
            <div className="ad-divider"></div>

            <div>
                <h3>{name}</h3>
            </div>
        </div>
    )
}

export default AdCard;