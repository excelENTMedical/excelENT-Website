'use client'

import { useState } from 'react'
import SpecialistCard from '@/components/SpecialistCard'

interface Specialist {
  name: string
  credentials?: string
  practiceName: string
  phone: string
  email?: string
  photo?: string
  address?: {
    street?: string
    city: string
    state: string
    zip?: string
  }
  specialties?: string[]
  location?: string
}

interface Location {
  value: string
  label: string
}

interface SpecialistDirectoryProps {
  specialists: Specialist[]
  locations: Location[]
}

export default function SpecialistDirectory({ specialists, locations }: SpecialistDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const filteredSpecialists = specialists.filter((specialist) => {
    const matchesSearch =
      searchQuery === '' ||
      specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialist.practiceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (specialist.address?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (specialist.address?.state || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLocation =
      selectedLocation === 'all' || specialist.location === selectedLocation

    return matchesSearch && matchesLocation
  })

  const allLocations: Location[] = [{ value: 'all', label: 'All Locations' }, ...locations]

  return (
    <>
      {/* Search & Filter */}
      <section className="bg-white border-b sticky top-16 md:top-20 z-40">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name, practice, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
              >
                {allLocations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <p className="text-gray-600 mb-8">
            Showing <span className="font-semibold">{filteredSpecialists.length}</span>{' '}
            specialist{filteredSpecialists.length !== 1 ? 's' : ''}
            {selectedLocation !== 'all' &&
              ` in ${allLocations.find((l) => l.value === selectedLocation)?.label}`}
          </p>

          {filteredSpecialists.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecialists.map((specialist, index) => (
                <SpecialistCard key={index} {...specialist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Specialists Found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn&apos;t find any specialists matching your search. Try
                adjusting your filters or search terms, or{' '}
                <a href="/connect" className="text-primary-600 hover:underline">
                  contact us
                </a>{' '}
                for assistance.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
