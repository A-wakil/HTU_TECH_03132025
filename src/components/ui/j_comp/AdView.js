"use client"

import { useRouter } from "next/navigation";
import Image from 'next/image';
import "./AdView.css"; 
import { TrendingUp } from "lucide-react"
import { 
    Bar, 
    BarChart, 
    CartesianGrid, 
    XAxis, 
    Area, 
    AreaChart, 
    Line, 
    LineChart, 
    PolarAngleAxis, 
    PolarGrid, 
    PolarRadiusAxis, 
    Radar, 
    RadarChart, 
    Pie, 
    PieChart, 
    Label,
    Cell,
    ResponsiveContainer 
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./Charts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/j_comp/dropdown-menu"

const browserData = [
  { browser: "chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { browser: "safari", visitors: 200, fill: "hsl(var(--chart-2))" },
  { browser: "firefox", visitors: 287, fill: "hsl(var(--chart-3))" },
  { browser: "edge", visitors: 173, fill: "hsl(var(--chart-4))" },
  { browser: "other", visitors: 190, fill: "hsl(var(--chart-5))" },
]

const monthlyData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

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

function AdView({ adData, name }) {
  const router = useRouter();
  const totalVisitors = browserData.reduce((acc, curr) => acc + curr.visitors, 0);

  const renderDot = (props) => {
    const { cx, cy, index } = props;
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="hsl(var(--primary))"
      />
    );
  };

  return (
    <div className="ad-view">
        <div className="ad-view-head">
            <button onClick={() => router.back()} className="back-button">⬅</button>
            <h1>{adData.name}</h1>
            <DropdownMenu>
                <DropdownMenuTrigger className="reiterate-button">
                    Reiterate
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push(`/greenads/reiterate/${adData.id}/option1`)}>
                        Option 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/greenads/reiterate/${adData.id}/option2`)}>
                        Option 2
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="ad-view-grid">
            <div className="ad-view-image">
                <div className="image-container">
                    <Image 
                        src="/Burger.PNG"
                        alt={`${adData.name} preview`}
                        width={400}
                        height={300}
                        className="ad-image"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            </div>

            <div className="analytics-grid">
              
                <Card>
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Audience Reach</CardTitle>
                        <CardDescription>Platform Performance Analysis</CardDescription>
                            
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={browserData}
                                        dataKey="visitors"
                                        nameKey="browser"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                        {browserData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                        <Label
                                            content={({ viewBox }) => (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                        {totalVisitors}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={viewBox.cy + 24} className="fill-muted-foreground">
                                                        Visitors
                                                    </tspan>
                                                </text>
                                            )}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Distribution</CardTitle>
                        <CardDescription>Total Revenue: $30, 000</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="desktop"
                                        stackId="1"
                                        stroke="hsl(var(--chart-1))"
                                        fill="hsl(var(--chart-1))"
                                        dot={renderDot}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="mobile"
                                        stackId="1"
                                        stroke="hsl(var(--chart-2))"
                                        fill="hsl(var(--chart-2))"
                                        dot={renderDot}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="items-center">
                        <CardTitle>Campaign Performance</CardTitle>
                        <CardDescription>Conversion Rate Analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={monthlyData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="month" />
                                    <PolarRadiusAxis />
                                    <Radar
                                        name="Desktop"
                                        dataKey="desktop"
                                        stroke="hsl(var(--chart-1))"
                                        fill="hsl(var(--chart-1))"
                                        fillOpacity={0.5}
                                    />
                                    <Radar
                                        name="Mobile"
                                        dataKey="mobile"
                                        stroke="hsl(var(--chart-2))"
                                        fill="hsl(var(--chart-2))"
                                        fillOpacity={0.5}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

export default AdView;