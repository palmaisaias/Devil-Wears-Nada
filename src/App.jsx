// src/App.jsx
import React from 'react'
import Book from './components/Book'
import Recipes from './components/Recipes'
import Movie from './components/Movie'
import MusicController from './components/MusicController'   // ⟵ add this

export default function App() {
  return (
    <main className="container">
      <MusicController />   {/* lives quietly, manages background audio */}
      <Book />
      <Recipes />
      <Movie />
    </main>
  )
}
