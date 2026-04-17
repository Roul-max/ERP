import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Home, Plus, Trash2 } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import { toastError, toastSuccess } from "../../utils/toast";

const Hostel: React.FC = () => {
  const [rooms, setRooms] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  
  const fetchRooms = async () => {
    try {
        const res = await client.get('/hostel');
        setRooms(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await client.post('/hostel', data);
      reset();
      fetchRooms();
    } catch (error) {
      toastError("Failed to add room");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this room?')) {
        try {
          await client.delete(`/hostel/${id}`);
          toastSuccess("Room deleted");
          fetchRooms();
        } catch (e) {
          toastError("Failed to delete room");
        }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel"
        description="Manage hostel rooms and occupancy."
      />
      
      <Card className="p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Add room
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <Input
            label="Hostel"
            placeholder="A-Block"
            {...register("name", { required: true })}
          />
          <Input
            label="Room no."
            placeholder="101"
            {...register("roomNumber", { required: true })}
          />
          <Select label="Type" {...register("type", { required: true })}>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </Select>
          <Input
            label="Capacity"
            type="number"
            {...register("capacity", { required: true })}
          />
          <Input
            label="Occupied"
            type="number"
            {...register("occupied", { required: true })}
          />

          <div className="lg:col-span-1">
            <Button type="submit" leftIcon={<Plus size={18} />} className="w-full">
              Add
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <Card key={room._id} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${room.type === 'Boys' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                    <Home size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{room.name} - {room.roomNumber}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{room.type} Hostel</p>
                 </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(room._id)}
                leftIcon={<Trash2 size={16} />}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-300">
                    <span>Occupancy</span>
                    <span>{room.occupied} / {room.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full ${room.occupied >= room.capacity ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min((room.occupied / room.capacity) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Hostel;
