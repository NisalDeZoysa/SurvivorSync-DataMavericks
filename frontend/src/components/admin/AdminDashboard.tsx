'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
} from 'lucide-react';

const chartConfig = {
  flood: { color: '#3B82F6' },
  earthquake: { color: '#EF4444' },
  householdFire: { color: '#F59E0B' },
  wildfire: { color: '#10B981' },
  powerOutage: { color: '#8B5CF6' },
  landslide: { color: '#A855F7' },  // added a color for landslide
  other: { color: '#6B7280' },
};



const AdminDashboard = () => {
  const [yearlyDisasterData, setYearlyDisasterData] = useState([]);
  const [currentYearStats, setCurrentYearStats] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [totalDisasters, setTotalDisasters] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [victimCount, setVictimCount] = useState(0);
  const [resourceCenterCount, setResourceCenterCount] = useState(0);



  useEffect(() => {
    const fetchData = async () => {
      try {
        //current year
        const disasterStatsRes = await axios.get('http://localhost:7000/api/disaster-stats');
        const statsData = disasterStatsRes.data;

        // Get the current year
        const currentYear = new Date().getFullYear().toString();

        if (statsData[currentYear]) {
          const rawData = statsData[currentYear];
          const formattedCurrentYearStats = Object.entries(rawData).map(([type, count]) => ({
            type,
            count,
            color: chartConfig[type.replace(/\s/g, '').charAt(0).toLowerCase() + type.replace(/\s/g, '').slice(1)]?.color || '#999999',
          })).filter(entry => Number(entry.count) > 0); // Optionally filter 0 counts

          setCurrentYearStats(formattedCurrentYearStats);
        }

        // Yearly disaster summary
        const yearlyRes1 = await axios.get('http://localhost:7000/api/disaster-stats');
        const yearlyData = yearlyRes1.data;

        const formattedYearlyData = Object.entries(yearlyData).map(([year, counts]) => ({
          year,
          flood: counts['Flood'] || 0,
          earthquake: counts['Earthquake'] || 0,
          householdFire: counts['Household Fire'] || 0,
          wildfire: counts['Wildfire'] || 0,
          powerOutage: counts['Power Outage'] || 0,
          other: counts['Other'] || 0,
        }));
        setYearlyDisasterData(formattedYearlyData);
            

        // District disaster data
        const districtRes = await axios.get('http://localhost:7000/api/district-disaster-summary');
        const rawDistrictData = districtRes.data;

        const transformedData = Object.entries(rawDistrictData).map(
          ([districtName, disasterCounts]) => ({
          district: districtName.replace(' District', ''),
          flood: disasterCounts['Flood'] || 0,
          earthquake: disasterCounts['Earthquake'] || 0,
          householdFire: disasterCounts['Household Fire'] || 0,
          wildfire: disasterCounts['Wildfire'] || 0,
          powerOutage: disasterCounts['Power Outage'] || 0,
          landslide: disasterCounts['Landslide'] || 0,
          other: disasterCounts['Other'] || 0,
          })
        );
        setDistrictData(transformedData);

        // Total disasters
        const totalRes = await axios.get('http://localhost:7000/api/disasters/count');
        setTotalDisasters(totalRes.data.totalDisasters || 0);

        // Users: volunteers & victims
        const usersRes = await axios.get('http://localhost:7000/api/users/count/volunteers-victims');
        const usersData = usersRes.data;
        setVolunteerCount(usersData.volunteerCount || 0);
        setVictimCount(usersData.victimCount || 0);

        // Resource centers
        const resCenterRes = await axios.get('http://localhost:7000/api/resource-centers/count');
        setResourceCenterCount(resCenterRes.data.totalResourceCenters || 0);

        // Optional: fetch yearly and current year chart data
        const yearlyRes = await axios.get('http://localhost:7000/api/disasters/yearly-summary');
        setYearlyDisasterData(yearlyRes.data || []);

        const currentRes = await axios.get('http://localhost:7000/api/disasters/current-year-stats');
        setCurrentYearStats(currentRes.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Disasters */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Disasters (2025)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalDisasters}</div>
            <p className="text-xs text-blue-600">Latest count from API</p>
          </CardContent>
        </Card>

        {/* Volunteers */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Volunteers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{volunteerCount}</div>
            <p className="text-xs text-green-600">From user count API</p>
          </CardContent>
        </Card>

        {/* Resource Centers */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Resource Centers</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{resourceCenterCount}</div>
            <p className="text-xs text-purple-600">Across all districts</p>
          </CardContent>
        </Card>

        {/* Victims */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Active Victims</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{victimCount}</div>
            <p className="text-xs text-orange-600">From user count API</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Disaster Trends by Year</CardTitle>
            <CardDescription>Past 5 years by disaster type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyDisasterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Bar dataKey="flood" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="earthquake" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="householdFire" stackId="a" fill="#F97316" />
                  <Bar dataKey="wildfire" stackId="a" fill="#DC2626" />
                  <Bar dataKey="powerOutage" stackId="a" fill="#FACC15" />
                  <Bar dataKey="other" stackId="a" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>2025 Disaster Distribution</CardTitle>
            <CardDescription>Current year by disaster type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentYearStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    label={({ type, count }) => `${type}: ${count}`}
                  >
                    {currentYearStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* District Table */}
      <Card>
        <CardHeader>
          <CardTitle>District-wise Disaster Statistics (2025)</CardTitle>
          <CardDescription>Breakdown by district and type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-900">District</th>
                  <th className="text-center p-3 font-semibold text-blue-600">Flood</th>
                  <th className="text-center p-3 font-semibold text-purple-600">Earthquake</th>
                  <th className="text-center p-3 font-semibold text-orange-600">Household Fire</th>
                  <th className="text-center p-3 font-semibold text-red-600">Wildfire</th>
                  <th className="text-center p-3 font-semibold text-yellow-600">Power Outage</th>
                  <th className="text-center p-3 font-semibold text-pink-600">Landslide</th>
                  <th className="text-center p-3 font-semibold text-green-600">Other</th>
                  <th className="text-center p-3 font-semibold text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map((district, index) => {
                  const total =
                    district.flood +
                    district.earthquake +
                    district.householdFire +
                    district.wildfire +
                    district.powerOutage +
                    district.landslide +
                    district.other;

                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{district.district}</td>
                      <td className="p-3 text-center text-blue-600">{district.flood}</td>
                      <td className="p-3 text-center text-purple-600">{district.earthquake}</td>
                      <td className="p-3 text-center text-orange-600">{district.householdFire}</td>
                      <td className="p-3 text-center text-red-600">{district.wildfire}</td>
                      <td className="p-3 text-center text-yellow-600">{district.powerOutage}</td>
                      <td className="p-3 text-center text-pink-600">{district.landslide}</td>
                      <td className="p-3 text-center text-green-600">{district.other}</td>
                      <td className="p-3 text-center font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
