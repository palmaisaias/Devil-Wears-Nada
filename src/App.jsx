// src/App.jsx
import React from 'react'
import Book from './components/Book'
import Recipes from './components/Recipes'
import Movie from './components/Movie'

export default function App() {
  return (
    <main className="container">
      <Book />
      <Recipes />
      <Movie />
    </main>
  )
}
