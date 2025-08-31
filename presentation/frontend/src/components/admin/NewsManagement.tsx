
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: 'emergency' | 'update' | 'announcement' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  publishDate: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
}

const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Flood Warning Issued for Western Province',
    content: 'Due to heavy rainfall, a flood warning has been issued for several districts in the Western Province. Residents are advised to take necessary precautions.',
    category: 'alert',
    priority: 'high',
    author: 'Emergency Response Team',
    publishDate: '2024-01-16',
    status: 'published',
    views: 1250
  },
  {
    id: '2',
    title: 'Emergency Response Training Program Launch',
    content: 'We are excited to announce the launch of our new emergency response training program for volunteers across all districts.',
    category: 'announcement',
    priority: 'medium',
    author: 'Admin Team',
    publishDate: '2024-01-15',
    status: 'published',
    views: 890
  },
  {
    id: '3',
    title: 'Update on Recent Landslide Response Operations',
    content: 'This is an update on the ongoing response operations for the recent landslide incident in Kandy district.',
    category: 'update',
    priority: 'medium',
    author: 'Field Coordinator',
    publishDate: '2024-01-14',
    status: 'draft',
    views: 0
  }
];

const NewsManagement = () => {
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<NewsArticle | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement' as 'emergency' | 'update' | 'announcement' | 'alert',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    author: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const handleAddArticle = () => {
    const newArticle: NewsArticle = {
      id: Date.now().toString(),
      ...formData,
      publishDate: new Date().toISOString().split('T')[0],
      views: 0
    };
    
    setNews([newArticle, ...news]);
    resetForm();
    setIsDialogOpen(false);
    toast.success('News article created successfully');
  };

  const handleEditArticle = () => {
    if (!editingArticle) return;
    
    const updatedNews = news.map(article =>
      article.id === editingArticle.id
        ? { ...article, ...formData }
        : article
    );
    
    setNews(updatedNews);
    resetForm();
    setEditingArticle(null);
    setIsDialogOpen(false);
    toast.success('News article updated successfully');
  };

  const handleDeleteArticle = (id: string) => {
    setNews(news.filter(article => article.id !== id));
    toast.success('News article deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'announcement',
      priority: 'medium',
      author: '',
      status: 'draft'
    });
  };

  const openDialog = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        priority: article.priority,
        author: article.author,
        status: article.status
      });
    } else {
      setEditingArticle(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const openViewDialog = (article: NewsArticle) => {
    setViewingArticle(article);
    setIsViewDialogOpen(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'alert': return 'bg-orange-100 text-orange-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
          <p className="text-gray-600">Create and manage emergency alerts, updates, and announcements</p>
        </div>
        
        <Button onClick={() => openDialog()} className="bg-safety-500 hover:bg-safety-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Article
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {news.filter(article => article.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {news.filter(article => article.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {news.reduce((total, article) => total + article.views, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
          <CardDescription>
            Manage emergency communications and public announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{article.title}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(article.priority)}`}>
                      {article.priority.charAt(0).toUpperCase() + article.priority.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>{article.publishDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{article.views}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(article)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(article)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? 'Edit News Article' : 'Create New Article'}
            </DialogTitle>
            <DialogDescription>
              {editingArticle ? 'Update the news article information' : 'Create a new news article or announcement'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="article-title">Title</Label>
              <Input
                id="article-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="article-content">Content</Label>
              <textarea
                id="article-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter article content"
                className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="article-category">Category</Label>
                <select
                  id="article-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'emergency' | 'update' | 'announcement' | 'alert' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="announcement">Announcement</option>
                  <option value="update">Update</option>
                  <option value="alert">Alert</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <Label htmlFor="article-priority">Priority</Label>
                <select
                  id="article-priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="article-author">Author</Label>
                <Input
                  id="article-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label htmlFor="article-status">Status</Label>
                <select
                  id="article-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={editingArticle ? handleEditArticle : handleAddArticle} 
              className="w-full"
            >
              {editingArticle ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
            <DialogDescription>
              Full article content and details
            </DialogDescription>
          </DialogHeader>
          {viewingArticle && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{viewingArticle.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(viewingArticle.category)}`}>
                    {viewingArticle.category.charAt(0).toUpperCase() + viewingArticle.category.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(viewingArticle.priority)}`}>
                    {viewingArticle.priority.charAt(0).toUpperCase() + viewingArticle.priority.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingArticle.status)}`}>
                    {viewingArticle.status.charAt(0).toUpperCase() + viewingArticle.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{viewingArticle.content}</p>
              </div>
              <div className="border-t pt-4 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Author:</strong> {viewingArticle.author}
                  </div>
                  <div>
                    <strong>Published:</strong> {viewingArticle.publishDate}
                  </div>
                  <div>
                    <strong>Views:</strong> {viewingArticle.views}
                  </div>
                  <div>
                    <strong>Article ID:</strong> {viewingArticle.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagement;