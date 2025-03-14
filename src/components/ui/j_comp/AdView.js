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
    Sector,
    Tooltip,
    ResponsiveContainer,
    YAxis,
    LabelList
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


const audienceData = [
    { month: "January", visitors: 186, fill: "hsl(var(--chart-1))" },
    { month: "February", visitors: 305, fill: "hsl(var(--chart-2))" },
    { month: "March", visitors: 237, fill: "hsl(var(--chart-3))" },
    { month: "April", visitors: 173, fill: "hsl(var(--chart-4))" },
    { month: "May", visitors: 209, fill: "hsl(var(--chart-5))" }
];


const monthlyData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
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

const barColors = {
    January: "hsl(var(--chart-1))",
    February: "hsl(var(--chart-2))",
    March: "hsl(var(--chart-3))",
    April: "hsl(var(--chart-4))",
    May: "hsl(var(--chart-5))",
    June: "hsl(var(--chart-6))"
};

function AdView({ adData, name }) {
    const router = useRouter();
    const [activeRevenueMonth, setActiveRevenueMonth] = useState("Jun");
    const activeIndex = revenueData.findIndex(item => item.month === activeRevenueMonth);
    const [activeAudienceMonth, setActiveAudienceMonth] = React.useState("January");
    const activeAudienceIndex = React.useMemo(
            () => audienceData.findIndex((item) => item.month === activeAudienceMonth),
            [activeAudienceMonth]
    );
    const audienceMonths = React.useMemo(() => audienceData.map((item) => item.month), []);


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

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 12}
                outerRadius={outerRadius + 25}
                fill={fill}
            />
        </g>
    );
};

  return (
    <div className="ad-view">
        <div className="ad-view-head">
            <button onClick={() => router.back()} className="back-button">⬅</button>
            <DropdownMenu>
                <DropdownMenuTrigger className="reiterate-button">
                    Re-iterate
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
                    <CardHeader className="flex-row items-start space-y-0 pb-0">
                        <div className="grid gap-1">
                            <CardTitle>Audience Reach</CardTitle>
                            <CardDescription>Platform Performance Analysis</CardDescription>
                        </div>
                        <Select 
                            value={activeAudienceMonth} 
                            onValueChange={setActiveAudienceMonth}
                        >
                            <SelectTrigger
                                className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                                aria-label="Select month"
                            >
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl">
                                {audienceMonths.map((month) => (
                                    <SelectItem
                                        key={month}
                                        value={month}
                                        className="rounded-lg [&_span]:flex"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <span
                                                className="flex h-3 w-3 shrink-0 rounded-sm"
                                                style={{
                                                    backgroundColor: `hsl(var(--chart-${audienceData.findIndex(item => item.month === month) + 1}))`
                                                }}
                                            />
                                            {month}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex flex-1 justify-center pb-0">
                        <div className="mx-auto aspect-square w-full max-w-[300px]">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={audienceData}
                                        dataKey="visitors"
                                        nameKey="month"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        activeIndex={activeAudienceIndex}
                                        activeShape={renderActiveShape}
                                        onMouseEnter={(_, index) => setActiveAudienceMonth(audienceData[index].month)}
                                    >
                                        {audienceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {audienceData[activeAudienceIndex].visitors.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="fill-muted-foreground"
                                                            >
                                                                Visitors
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            <TrendingUp className="h-4 w-4" />
                            <span>18% audience growth</span>
                        </div>
                        <div className="leading-none text-muted-foreground">
                        Showing platform-wise audience distribution
                        </div>
                    </CardFooter>
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
                                        type="linear"
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
                                                    key={`active-dot-${index}`}
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
                    <CardHeader>
                        <CardTitle>Campaign Performance</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={monthlyData}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 20,
                                        bottom: 25
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <Tooltip
                                        cursor={false}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm font-bold">
                                                                {payload[0].value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                   <Bar 
                                        dataKey="desktop" 
                                        radius={8}
                                    >
                                        {monthlyData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`}
                                                fill={barColors[entry.month]}
                                            />
                                        ))}
                                        <LabelList
                                            position="top"
                                            offset={12}
                                            className="fill-foreground"
                                            fontSize={12}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            Campaign effectiveness up by 15.8% <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing campaign performance metrics across platforms
                        </div>
                    </CardFooter>
                </Card>

               
            </div>
        </div>
    </div>
  );
}

export default AdView;