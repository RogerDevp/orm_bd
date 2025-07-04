import { useEffect, useState } from 'react';
import axios from "axios";
import { format } from "date-fns";
import './App.css';

const baseUrl = "http://localhost:5000";

function App() {
  const [description, setDescription] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [eventId, setEventId] = useState(null);

  const fetchEvents = async () => {
    const data = await axios.get(`${baseUrl}/events`);
    const { events } = data.data;
    setEventsList(events);
  };

  const handleChange = (e, field) => {
    if (field === 'edit') {
      setEditDescription(e.target.value);
    } else {
      setDescription(e.target.value);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/events/${id}`);
      const updatedList = eventsList.filter(event => event.id !== id);
      setEventsList(updatedList);
    } catch (err) {
      console.error("Error al eliminar:", err.message);
    }
  };

  const toggleEdit = (event) => {
    setEventId(event.id);
    setEditDescription(event.description);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (eventId !== null) {
        // Editar
        const data = await axios.put(`${baseUrl}/events/${eventId}`, {
          description: editDescription,
        });
        const updatedEvent = data.data.event;
        const updatedList = eventsList.map(event =>
          event.id === eventId ? updatedEvent : event
        );
        setEventsList(updatedList);
      } else {
        // Crear
        const data = await axios.post(`${baseUrl}/events`, {
          description: description,
        });
        const newEvent = data.data;
        setEventsList([...eventsList, newEvent]);
      }

      // Limpiar campos
      setDescription('');
      setEditDescription('');
      setEventId(null);
    } catch (err) {
      console.error("Error en handleSubmit:", err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="App">
      <section>
        <form onSubmit={handleSubmit}>
          <label htmlFor="description">Descripción</label>
          <input
            onChange={(e) => handleChange(e, 'description')}
            type="text"
            name="description"
            id="description"
            placeholder='Describe el evento'
            value={description}
          />
          <button type="submit">Crear</button>
        </form>
      </section>
      <section>
        <ul>
          {eventsList.map(event => (
            <li style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between" }} key={event.id}>
              {eventId === event.id ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexGrow: 1, gap: "10px", alignItems: "center" }}>
                  <input
                    onChange={(e) => handleChange(e, 'edit')}
                    type="text"
                    name="editDescription"
                    id="editDescription"
                    value={editDescription}
                    style={{ flexGrow: 1 }}
                  />
                  <button type="submit">Guardar</button>
                  <button onClick={() => setEventId(null)} type="button" style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                </form>
              ) : (
                <>
                  <span style={{ flexGrow: 1, textAlign: 'left' }}>
                    {format(new Date(event.created_at), "MM/dd, p")}: {" "}
                    {event.description}
                  </span>
                  <div>
                    <button onClick={() => toggleEdit(event)}>Editar</button>
                    <button onClick={() => handleDelete(event.id)}>X</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
