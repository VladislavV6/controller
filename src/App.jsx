import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:3000/api/items'

function App() {
    const [items, setItems] = useState([])
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [editingId, setEditingId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searchId, setSearchId] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)

    const fetchItems = async () => {
        try {
            setLoading(true)
            const response = await axios.get(API_URL)
            setItems(response.data)
            setSearchResult(null)
        } catch (error) {
            console.error('Error fetching items:', error)
            alert('Error fetching items')
        } finally {
            setLoading(false)
        }
    }

    const searchItemById = async () => {
        if (!searchId.trim()) {
            alert('Please enter item ID')
            return
        }

        try {
            setSearchLoading(true)
            const response = await axios.get(`${API_URL}/${searchId}`)
            setSearchResult(response.data)
            setSearchId('')
        } catch (error) {
            if (error.response?.status === 404) {
                alert('Item not found')
            } else {
                console.error('Error searching item:', error)
                alert('Error searching item')
            }
            setSearchResult(null)
        } finally {
            setSearchLoading(false)
        }
    }

    const clearSearch = () => {
        setSearchResult(null)
        fetchItems()
    }

    const createItem = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(API_URL, formData)
            setItems([response.data, ...items])
            setFormData({ name: '', description: '' })
            setSearchResult(null)
            alert('Item created successfully!')
        } catch (error) {
            console.error('Error creating item:', error)
            alert('Error creating item')
        }
    }

    const updateItem = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.put(`${API_URL}/${editingId}`, formData)
            setItems(items.map(item => item.id === editingId ? response.data : item))
            setFormData({ name: '', description: '' })
            setEditingId(null)
            setSearchResult(null)
            alert('Item updated successfully!')
        } catch (error) {
            console.error('Error updating item:', error)
            alert('Error updating item')
        }
    }

    const deleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            await axios.delete(`${API_URL}/${id}`)
            setItems(items.filter(item => item.id !== id))
            if (searchResult && searchResult.id === id) {
                setSearchResult(null)
            }
            alert('Item deleted successfully!')
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Error deleting item')
        }
    }

    const startEdit = (item) => {
        setFormData({ name: item.name, description: item.description || '' })
        setEditingId(item.id)
        setSearchResult(null)
    }

    const cancelEdit = () => {
        setFormData({ name: '', description: '' })
        setEditingId(null)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    return (
        <div className="app">

            <div className="search-section">
                <h2>Search Item by ID</h2>
                <div className="search-controls">
                    <input
                        type="number"
                        placeholder="Enter item ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        min="1"
                    />
                    <button
                        onClick={searchItemById}
                        disabled={searchLoading}
                        className="search-btn"
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                    {searchResult && (
                        <button onClick={clearSearch} className="clear-btn">
                            Show All
                        </button>
                    )}
                </div>
            </div>

            {searchResult && (
                <div className="search-result">
                    <h3>Search Result:</h3>
                    <div className="item-card highlighted">
                        <h4>{searchResult.name}</h4>
                        <p>{searchResult.description || 'No description'}</p>
                        <div className="item-meta">
                            <small>ID: {searchResult.id}</small>
                            <small>Created: {new Date(searchResult.created_at).toLocaleDateString()}</small>
                            <small>Updated: {new Date(searchResult.updated_at).toLocaleDateString()}</small>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => startEdit(searchResult)} className="edit">
                                Edit
                            </button>
                            <button onClick={() => deleteItem(searchResult.id)} className="delete">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={editingId ? updateItem : createItem} className="form">
                <h2>{editingId ? 'Edit Item' : 'Create New Item'}</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <div className="form-buttons">
                    <button type="submit">
                        {editingId ? 'Update' : 'Create'} Item
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="cancel">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="items-section">
                <h2>Items List {searchResult && '(Filtered)'}</h2>
                <button onClick={fetchItems} disabled={loading} className="refresh-btn">
                    {loading ? 'Loading...' : 'Refresh Items'}
                </button>

                {items.length === 0 && !searchResult ? (
                    <p>No items found. Create your first item!</p>
                ) : (
                    <div className="items-grid">
                        {(searchResult ? [searchResult] : items).map(item => (
                            <div key={item.id} className={`item-card ${searchResult ? 'highlighted' : ''}`}>
                                <h3>{item.name}</h3>
                                <p>{item.description || 'No description'}</p>
                                <div className="item-meta">
                                    <small>ID: {item.id}</small>
                                    <small>Created: {new Date(item.created_at).toLocaleDateString()}</small>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => startEdit(item)} className="edit">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteItem(item.id)} className="delete">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default App