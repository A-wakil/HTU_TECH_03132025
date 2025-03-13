"use client"

import { useRouter } from "next/navigation";
import Image from 'next/image';
import "./AdCard.css"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
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

function AdCard({ id, name, chartData, imageIndex }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/greenads/add-view/${id}`);
    };

   
    const getImagePath = () => {
        switch(imageIndex) {
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
                return "/fries.jpeg";
            case 6:
                return "/drinks.jpeg";
            case 7:
                return "/tenders.jpeg";
            default:
                return "/Burger.PNG";
        }
    };
    return(
        <div className="ad-card" onClick={handleClick}>
            <div className="chart-container">
                <Image 
                    src={getImagePath()}
                    alt={name}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={true}
                />
                <div className="name-overlay">
                    <h3>{name}</h3>
                </div>
            
                {/* <ChartContainer config={chartConfig}>
                    <BarChart 
                        width={200}  // Increased width
                        height={120}  // Increased height
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 5,
                            left: 5,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeWidth={0.5} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            tick={{ fontSize: 10, fontWeight: 600 }}
                        />
                        <Bar 
                            dataKey="desktop" 
                            fill="hsl(var(--chart-1))" 
                            radius={[2, 2, 0, 0]}
                            strokeWidth={2}
                        />
                        <Bar 
                            dataKey="mobile" 
                            fill="hsl(var(--chart-2))" 
                            radius={[2, 2, 0, 0]}
                            strokeWidth={2}
                        />
                    </BarChart>
                </ChartContainer> */}
            </div>
        </div>
    )
}

export default AdCard;