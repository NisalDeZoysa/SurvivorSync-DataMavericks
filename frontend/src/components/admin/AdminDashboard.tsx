
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Users, MapPin, Calendar } from 'lucide-react';

// Mock data for demonstration
const yearlyDisasterData = [
  { year: 2020, flood: 45, fire: 23, earthquake: 12, landslide: 8, other: 15 },
  { year: 2021, flood: 52, fire: 31, earthquake: 9, landslide: 12, other: 18 },
  { year: 2022, flood: 38, fire: 28, earthquake: 15, landslide: 10, other: 22 },
  { year: 2023, flood: 41, fire: 35, earthquake: 8, landslide: 14, other: 19 },
  { year: 2024, flood: 48, fire: 29, earthquake: 11, landslide: 16, other: 21 },
];

const districtData = [
  { district: 'Colombo', flood: 15, fire: 8, earthquake: 3, landslide: 2, other: 5 },
  { district: 'Kandy', flood: 12, fire: 6, earthquake: 2, landslide: 8, other: 4 },
  { district: 'Galle', flood: 10, fire: 4, earthquake: 1, landslide: 3, other: 3 },
  { district: 'Jaffna', flood: 8, fire: 7, earthquake: 2, landslide: 1, other: 6 },
  { district: 'Matara', flood: 6, fire: 3, earthquake: 1, landslide: 4, other: 2 },
];

const currentYearStats = [
  { type: 'Flood', count: 48, color: '#3B82F6' },
  { type: 'Fire', count: 29, color: '#EF4444' },
  { type: 'Earthquake', count: 11, color: '#8B5CF6' },
  { type: 'Landslide', count: 16, color: '#F59E0B' },
  { type: 'Other', count: 21, color: '#10B981' },
];

const chartConfig = {
  flood: { label: 'Flood', color: '#3B82F6' },
  fire: { label: 'Fire', color: '#EF4444' },
  earthquake: { label: 'Earthquake', color: '#8B5CF6' },
  landslide: { label: 'Landslide', color: '#F59E0B' },
  other: { label: 'Other', color: '#10B981' },
};

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Disasters (2024)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">125</div>
            <p className="text-xs text-blue-600">+12% from last year</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Volunteers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">342</div>
            <p className="text-xs text-green-600">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Resource Centers</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">28</div>
            <p className="text-xs text-purple-600">Across all districts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Response Time Avg</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">18 min</div>
            <p className="text-xs text-orange-600">-3 min from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Disaster Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Disaster Trends by Year</CardTitle>
            <CardDescription>
              Historical data showing disaster occurrences by type over the past 5 years
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyDisasterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="flood" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="fire" stackId="a" fill="#EF4444" />
                  <Bar dataKey="earthquake" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="landslide" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="other" stackId="a" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Current Year Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>2024 Disaster Distribution</CardTitle>
            <CardDescription>
              Breakdown of disaster types for the current year
            </CardDescription>
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

      {/* District Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>District-wise Disaster Statistics (2024)</CardTitle>
          <CardDescription>
            Detailed breakdown of disasters by district and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-900">District</th>
                  <th className="text-center p-3 font-semibold text-blue-600">Flood</th>
                  <th className="text-center p-3 font-semibold text-red-600">Fire</th>
                  <th className="text-center p-3 font-semibold text-purple-600">Earthquake</th>
                  <th className="text-center p-3 font-semibold text-yellow-600">Landslide</th>
                  <th className="text-center p-3 font-semibold text-green-600">Other</th>
                  <th className="text-center p-3 font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map((district, index) => {
                  const total = district.flood + district.fire + district.earthquake + district.landslide + district.other;
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium">{district.district}</td>
                      <td className="p-3 text-center text-blue-600">{district.flood}</td>
                      <td className="p-3 text-center text-red-600">{district.fire}</td>
                      <td className="p-3 text-center text-purple-600">{district.earthquake}</td>
                      <td className="p-3 text-center text-yellow-600">{district.landslide}</td>
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