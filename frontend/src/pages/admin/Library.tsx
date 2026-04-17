import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Book, Plus, Trash2 } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import { toastError, toastSuccess } from "../../utils/toast";

const Library: React.FC = () => {
  const [books, setBooks] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  
  const fetchBooks = async () => {
    try {
        const res = await client.get('/library');
        setBooks(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await client.post('/library', data);
      reset();
      fetchBooks();
      toastSuccess("Book added");
    } catch (error) {
      toastError("Failed to add book");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this book?')) {
        try {
          await client.delete(`/library/${id}`);
          toastSuccess("Book deleted");
          fetchBooks();
        } catch {
          toastError("Failed to delete book");
        }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Catalog books and manage availability."
      />
      
      <Card className="p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Add book
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <Input label="Title" placeholder="Clean Code" {...register("title", { required: true })} />
          <Input label="Author" placeholder="Robert C. Martin" {...register("author", { required: true })} />
          <Input label="ISBN" placeholder="9780132350884" {...register("isbn", { required: true })} />
          <Input label="Category" placeholder="Software Engineering" {...register("category", { required: true })} />
          <Input label="Quantity" type="number" {...register("quantity", { required: true })} />
          <div className="flex gap-2 items-end">
            <Input label="Available" type="number" {...register("available", { required: true })} />
            <Button type="submit" leftIcon={<Plus size={18} />} className="h-11">
              Add
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book: any) => (
          <Card key={book._id} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Book size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                 </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(book._id)}
                leftIcon={<Trash2 size={16} />}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">{book.category}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">ISBN</p>
                    <p className="font-medium text-gray-900 dark:text-white">{book.isbn}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-medium text-gray-900 dark:text-white">{book.quantity}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Available</p>
                    <p className="font-medium text-green-600">{book.available}</p>
                </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Library;
