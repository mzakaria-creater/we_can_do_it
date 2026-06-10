import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Plus, Trash2, RefreshCw, CheckCircle, Zap, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

// ✅ FIX: Correct API URL - removed duplicate /server path
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-46c3f42b`;

export const SupabaseExample = () => {
  const { language } = useStore();
  const isRTL = language === 'ar';
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Fetch todos from API
  const getTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.todos) {
        // Map KV store data to Todo format
        const todoItems: Todo[] = data.todos.map((todo: any) => ({
          id: todo.id || `todo-${Date.now()}-${Math.random()}`,
          title: todo.title || '',
          completed: todo.completed || false,
          created_at: todo.created_at || new Date().toISOString()
        }))
        // Filter out any invalid items
        .filter((todo: Todo) => todo.id && todo.title);
        
        // Sort by id (timestamp-based) descending with null checks
        todoItems.sort((a, b) => {
          if (!a.id || !b.id) return 0;
          return b.id.localeCompare(a.id);
        });
        
        setTodos(todoItems);
        toast.success(`${isRTL ? 'تم تحميل' : 'Loaded'} ${todoItems.length} ${isRTL ? 'عنصر' : 'items'}`);
      }
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      toast.error(isRTL ? 'فشل في تحميل البيانات' : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال عنوان' : 'Please enter a title');
      return;
    }

    try {
      setAdding(true);
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTodo.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.todo) {
        const newItem: Todo = {
          id: data.todo.id,
          title: data.todo.title,
          completed: data.todo.completed,
          created_at: data.todo.created_at
        };
        setTodos([newItem, ...todos]);
        setNewTodo('');
        toast.success(isRTL ? 'تمت الإضافة بنجاح!' : 'Added successfully!');
      }
    } catch (err: any) {
      console.error('Error adding todo:', err);
      toast.error(isRTL ? 'فشل في الإضافة' : 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: todo.title,
          completed: !completed,
          created_at: todo.created_at
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTodos(todos.map(t => 
          t.id === id ? { ...t, completed: !completed } : t
        ));
        toast.success(isRTL ? 'تم التحديث!' : 'Updated!');
      }
    } catch (err: any) {
      console.error('Error updating todo:', err);
      toast.error(isRTL ? 'فشل في التحديث' : 'Failed to update');
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTodos(todos.filter(t => t.id !== id));
        toast.success(isRTL ? 'تم الحذف!' : 'Deleted!');
      }
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      toast.error(isRTL ? 'فشل في الحذف' : 'Failed to delete');
    }
  };

  // Seed todos
  const seedTodos = async () => {
    try {
      setSeeding(true);
      const response = await fetch(`${API_URL}/todos/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        getTodos();
        toast.success(isRTL ? 'تم تعبئة البيانات بنجاح!' : 'Data seeded successfully!');
      }
    } catch (err: any) {
      console.error('Error seeding todos:', err);
      toast.error(isRTL ? 'فشل في تعبئة البيانات' : 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F14] p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B0F14]" />
              </div>
              {isRTL ? 'مثال Supabase' : 'Supabase Example'}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              {isRTL ? 'مثال توضيحي لاستخدام Supabase KV Store عبر Edge Functions في Press2Pay' : 'Demo of Supabase KV Store via Edge Functions in Press2Pay'}
            </p>
          </div>

          <button
            onClick={getTodos}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 sm:py-3 rounded-lg transition-all border border-white/10 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm sm:text-base">{isRTL ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold mb-1 text-sm sm:text-base">
                {isRTL ? 'معلومات الاتصال' : 'Connection Info'}
              </p>
              <p className="text-gray-300 text-xs sm:text-sm break-all">
                <strong className="text-blue-400">Architecture:</strong> Frontend → Edge Function → KV Store<br/>
                <strong className="text-blue-400">Storage:</strong> kv_store_46c3f42b (key, value)
              </p>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            {isRTL ? 'إضافة مهمة جديدة' : 'Add New Todo'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder={isRTL ? 'أدخل عنوان المهمة...' : 'Enter todo title...'}
              className="flex-1 bg-[#0B0F14] border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-gray-500 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 outline-none"
            />
            <button
              onClick={addTodo}
              disabled={adding || !newTodo.trim()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C49F27] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F14] font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isRTL ? 'إضافة' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Todos List */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isRTL ? 'قائمة المهام' : 'Data Items'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {todos.length} {isRTL ? 'عنصر' : 'items'}
            </p>
          </div>

          <div className="p-3 sm:p-4">
            {loading ? (
              <div className="text-center py-12 sm:py-20">
                <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 animate-spin mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <Database className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
                  {isRTL ? 'لا توجد بيانات' : 'No Data Yet'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  {isRTL ? 'أضف أول عنصر أعلاه' : 'Add your first item above'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo, idx) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          todo.completed
                            ? 'bg-green-500/20 border-green-500/50'
                            : 'border-white/30 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {todo.completed && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base text-white font-medium break-words ${todo.completed ? 'line-through opacity-50' : ''}`}>
                          {todo.title}
                        </p>
                        {todo.created_at && (
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                            {new Date(todo.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 sm:p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-[#14181D]/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isRTL ? 'مثال الكود' : 'Code Example'}
            </h2>
          </div>
          <div className="p-3 sm:p-6">
            <pre className="bg-[#0B0F14] border border-white/10 rounded-lg p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
              <code className="text-gray-300 font-mono">
{`// Fetch data via Edge Function
const response = await fetch(\`\${API_URL}/todos\`, {
  headers: {
    'Authorization': \`Bearer \${publicAnonKey}\`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Create todo
await fetch(\`\${API_URL}/todos\`, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${publicAnonKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'New Todo' })
});

// Update todo
await fetch(\`\${API_URL}/todos/\${id}\`, {
  method: 'PUT',
  body: JSON.stringify({ completed: true })
});

// Delete todo
await fetch(\`\${API_URL}/todos/\${id}\`, {
  method: 'DELETE'
});`}
              </code>
            </pre>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-bold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            {isRTL ? 'معمارية التطبيق' : 'Application Architecture'}
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
            {isRTL 
              ? 'هذا المثال يستخدم معمارية ثلاثية الطبقات آمنة مع Edge Functions' 
              : 'This example uses a secure 3-tier architecture with Edge Functions'
            }
          </p>
          <div className="bg-[#0B0F14] border border-white/10 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
              <p className="text-gray-300 text-xs sm:text-sm">
                <strong className="text-[#D4AF37]">{isRTL ? 'الطبقة الأمامية:' : 'Frontend:'}</strong> {isRTL ? 'واجهة React' : 'React UI'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <p className="text-gray-300 text-xs sm:text-sm">
                <strong className="text-blue-400">{isRTL ? 'الخادم:' : 'Server:'}</strong> Supabase Edge Functions (Deno + Hono)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <p className="text-gray-300 text-xs sm:text-sm">
                <strong className="text-green-400">{isRTL ? 'قاعدة البيانات:' : 'Database:'}</strong> {isRTL ? 'تخزين KV مع صلاحيات آمنة' : 'KV Store with secure permissions'}
              </p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-2 sm:p-3">
            <p className="text-green-300 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {isRTL 
                  ? '✅ الأمان: لا وصول مباشر لقاعدة البيانات من الواجهة الأمامية' 
                  : '✅ Secure: No direct database access from frontend'
                }
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};