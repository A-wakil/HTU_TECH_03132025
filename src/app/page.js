"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Dot, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Sector, Label } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React from "react";
import { Bar, BarChart } from "recharts";

export default function Home() {
  // Add sample data for each metric
  const revenueData = [
    { month: "Jan", value: 98000 },
    { month: "Feb", value: 105000 },
    { month: "Mar", value: 110000 },
    { month: "Apr", value: 115000 },
    { month: "May", value: 118000 },
    { month: "Jun", value: 123456 },
  ];

  const roiData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 95 },
    { month: "Mar", value: 85 },
    { month: "Apr", value: 110 },
    { month: "May", value: 95 },
    { month: "Jun", value: 115 },
  ];

  const conversionData = [
    { month: "Jan", value: 4.8, fill: "hsl(var(--chart-1))" },
    { month: "Feb", value: 4.9, fill: "hsl(var(--chart-2))" },
    { month: "Mar", value: 5.0, fill: "hsl(var(--chart-3))" },
    { month: "Apr", value: 5.1, fill: "hsl(var(--chart-4))" },
    { month: "May", value: 5.0, fill: "hsl(var(--chart-5))" },
    { month: "Jun", value: 5.2, fill: "hsl(var(--chart-6))" },
  ];

  const [activeConversionMonth, setActiveConversionMonth] = React.useState("Jun");

  const [activeRevenueMonth, setActiveRevenueMonth] = React.useState("Jun");

  const [activeMonth, setActiveMonth] = React.useState("Jun");

  const revenueChartConfig = {
    value: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    Jan: {
      label: "January",
      color: "hsl(var(--chart-1))",
    },
    Feb: {
      label: "February",
      color: "hsl(var(--chart-2))",
    },
    Mar: {
      label: "March",
      color: "hsl(var(--chart-3))",
    },
    Apr: {
      label: "April",
      color: "hsl(var(--chart-4))",
    },
    May: {
      label: "May",
      color: "hsl(var(--chart-5))",
    },
    Jun: {
      label: "June",
      color: "hsl(var(--chart-6))",
    },
  };

  const roiChartConfig = {
    value: {
      label: "ROI",
      color: "hsl(var(--chart-2))",
    },
  };

  const conversionChartConfig = {
    value: {
      label: "Conversion Rate",
    },
    Jan: {
      label: "January",
      color: "hsl(var(--chart-1))",
    },
    Feb: {
      label: "February",
      color: "hsl(var(--chart-2))",
    },
    Mar: {
      label: "March",
      color: "hsl(var(--chart-3))",
    },
    Apr: {
      label: "April",
      color: "hsl(var(--chart-4))",
    },
    May: {
      label: "May",
      color: "hsl(var(--chart-5))",
    },
    Jun: {
      label: "June",
      color: "hsl(var(--chart-6))",
    },
  };

  const co2Data = [
    { month: "January", value: 1.8 },
    { month: "February", value: 2.0 },
    { month: "March", value: 2.2 },
    { month: "April", value: 2.3 },
    { month: "May", value: 2.6 },
    { month: "June", value: 2.4 },
  ];

  const co2ChartConfig = {
    value: {
      label: "CO2 Saved",
      color: "hsl(var(--chart-1))",
    },
  };

  const renderRevenueChart = () => {
    const activeIndex = revenueData.findIndex(
      (item) => item.month === activeRevenueMonth
    );

    return (
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
          <ChartContainer config={revenueChartConfig}>
            <LineChart
              width={300}
              height={100}
              data={revenueData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" nameKey="value" />}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  return (
                    <Dot
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--primary))"
                    />
                  );
                }}
                activeDot={(props) => {
                  const { cx, cy, index } = props;
                  return (
                    <Dot
                      key={`active-dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </LineChart>
          </ChartContainer>
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
    );
  };

  const renderROIChart = () => (
    <Card className={styles.metricCard}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Return on Investment</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="h-8 w-[130px] rounded-lg"
            aria-label="Select month"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {roiData.map(({ month }) => (
              <SelectItem
                key={month}
                value={month}
                className="rounded-lg [&_span]:flex"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <p className={styles.metricValue}>
          {roiData.find(item => item.month === activeMonth)?.value}%
        </p>
        <ChartContainer config={roiChartConfig}>
          <LineChart
            data={roiData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="linear"
              dataKey="value"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{
                fill: "hsl(var(--chart-2))",
                strokeWidth: 2,
                r: 4,
                stroke: "hsl(var(--background))"
              }}
              activeDot={{
                r: 6,
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
          <span>8% from last month</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing ROI trends over time
        </div>
      </CardFooter>
    </Card>
  );

  const renderConversionChart = () => {
    const activeIndex = conversionData.findIndex(
      (item) => item.month === activeConversionMonth
    );

    return (
      <Card className={styles.metricCard}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </div>
          <Select value={activeConversionMonth} onValueChange={setActiveConversionMonth}>
            <SelectTrigger
              className="h-8 w-[130px] rounded-lg"
              aria-label="Select month"
            >
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {conversionData.map(({ month }) => (
                <SelectItem
                  key={month}
                  value={month}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: conversionChartConfig[month].color,
                      }}
                    />
                    {conversionChartConfig[month].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <ChartContainer
            config={conversionChartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={conversionData}
                dataKey="value"
                nameKey="month"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({ outerRadius = 0, ...props }) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
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
                            {conversionData[activeIndex].value}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Conversion Rate
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            <TrendingUp className="h-4 w-4" />
            <span>0.5% from last month</span>
          </div>
          <div className="leading-none text-muted-foreground">
            Showing conversion rate by month
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderCO2Chart = () => (
    <Card className={styles.metricCard}>
      <CardHeader>
        <CardTitle>CO2 Emissions Saved</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={styles.metricValue}>2.4 tons</p>
        <ChartContainer config={co2ChartConfig}>
          <BarChart 
            data={co2Data}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingDown className="h-4 w-4" />
          <span>15% from last month</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing CO2 emissions saved by month
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Image
              src="/avata_logo.webp"
              alt="Avata Logo"
              width={60}
              height={60}
              priority
              className={styles.logo}
            />
          </div>
          <div className={styles.headerText}>
            <h1>Avata Analytics Dashboard</h1>
            <p>Master the four elements of digital advertising</p>
          </div>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        {renderRevenueChart()}
        {renderROIChart()}
        {renderConversionChart()}
        {renderCO2Chart()}
      </section>

      <section className={styles.features}>
        <h2>AI Agent Solutions</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Build</h3>
            <p>Generate personalized ad content automatically</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Review</h3>
            <p>Get AI-powered insights on your ad creatives</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Measure</h3>
            <p>Track performance and environmental impact</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Reiterate</h3>
            <p>Optimize ads in real-time with live AI agents</p>
          </div>
        </div>
      </section>
    </div>
  );
}
