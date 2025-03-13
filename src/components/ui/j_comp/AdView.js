"use client"

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import styles from "./AdView.css"
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
    Tooltip,
    ResponsiveContainer,
    YAxis
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const browserData = [
  { browser: "chrome", visitors: 275, fill: "hsl(var(--chart-1))" },
  { browser: "safari", visitors: 200, fill: "hsl(var(--chart-2))" },
  { browser: "firefox", visitors: 287, fill: "hsl(var(--chart-3))" },
  { browser: "edge", visitors: 173, fill: "hsl(var(--chart-4))" },
  { browser: "other", visitors: 190, fill: "hsl(var(--chart-5))" },
]

const monthlyData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
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

const revenueData = [
    { month: "Jan", value: 2400 },
    { month: "Feb", value: 3600 },
    { month: "Mar", value: 2800 },
    { month: "Apr", value: 4200 },
    { month: "May", value: 3800 },
    { month: "Jun", value: 4600 }
];

const revenueChartConfig = {
    Jan: { label: "Jan", color: "hsl(var(--chart-1))" },
    Feb: { label: "Feb", color: "hsl(var(--chart-2))" },
    Mar: { label: "Mar", color: "hsl(var(--chart-3))" },
    Apr: { label: "Apr", color: "hsl(var(--chart-4))" },
    May: { label: "May", color: "hsl(var(--chart-5))" },
    Jun: { label: "Jun", color: "hsl(var(--chart-6))" }
};

function AdView({ adData, name }) {
  const router = useRouter();
  const totalVisitors = browserData.reduce((acc, curr) => acc + curr.visitors, 0);
  const [activeRevenueMonth, setActiveRevenueMonth] = useState("Jun");
  const activeIndex = revenueData.findIndex(item => item.month === activeRevenueMonth);

    const getImagePath = () => {
        switch(adData.id) {
            case 0:
                return "/Burger.PNG";
            case 1:
                return "/icecream.png";
            case 2:
                return "/cake.png";
            case 3:
                return "/pizza.jpeg";
            case 4:
                return "/Burger2.jpeg";
            case 5:
                return "/drinks.jpeg";
            case 6:
                return "/fries.jpeg";
            case 7:
                return "/tenders.jpeg";
            default:
                return "/Burger.PNG";
        }
    };

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
                        src={getImagePath()}
                        alt={`${adData.name} preview`}
                        fill
                        className="ad-image"
                        style={{ objectFit: 'cover' }}  
                        priority={true}
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

                <Card className={styles.metricCard}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Revenue from Ads</CardTitle>
                            <CardDescription>January - June 2024</CardDescription>
                        </div>
                        <Select value={activeRevenueMonth} onValueChange={setActiveRevenueMonth}>
                            <SelectTrigger
                                className="h-8 w-[130px] rounded-lg"
                                aria-label="Select month"
                            >
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl">
                                {revenueData.map(({ month }) => (
                                    
                                    <SelectItem
                                        key={month}

                                        value={month}
                                        className="rounded-lg [&_span]:flex"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <span
                                                className="flex h-3 w-3 shrink-0 rounded-sm"
                                                style={{
                                                    backgroundColor: revenueChartConfig[month].color,
                                                }}
                                            />
                                            {revenueChartConfig[month].label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <p className={styles.metricValue}>
                            ${revenueData[activeIndex].value.toLocaleString()}
                        </p>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart
                                    data={revenueData}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 20,
                                        bottom: 25
                                    }}
                                >
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        interval={0}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <Tooltip
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-bold">
                                                                ${payload[0].value.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="hsl(var(--chart-2))"
                                        strokeWidth={2}
                                        dot={(props) => {
                                            const { cx, cy, index } = props;
                                            return (
                                                <circle
                                                    key={`dot-${index}`}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={4}
                                                    fill={`hsl(var(--chart-${index + 1}))`}
                                                    stroke="hsl(var(--background))"
                                                    strokeWidth={2}
                                                />
                                            );
                                        }}
                                        activeDot={(props) => {
                                            const { cx, cy, index } = props;
                                            return (
                                                <circle
                                                    key={`activeDot-${index}`}
                                                    cx={cx}
                                                    cy={cy}
                                                    r={6}
                                                    fill={`hsl(var(--chart-${index + 1}))`}
                                                    stroke="hsl(var(--background))"
                                                    strokeWidth={2}
                                                />
                                            );
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            <TrendingUp className="h-4 w-4" />
                            <span>12% from last month</span>
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing revenue from ads by month
                        </div>
                    </CardFooter>
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