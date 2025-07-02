'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCard } from '@/components/ProjectCard'

interface Repository {
  id: number
  name: string
  description: string
  html_url: string
  language: string
  stargazers_count: number
}

export default function Dashboard() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user repositories from backend
    const fetchRepositories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/repos`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setRepositories(data)
        }
      } catch (error) {
        console.error('Failed to fetch repositories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepositories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your portfolio and view your GitHub repositories
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/edit">
            <Button>
              Edit Portfolio
            </Button>
          </Link>
          <Link href="/preview/username">
            <Button variant="outline">
              View Portfolio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Views</CardTitle>
            <CardDescription>Total views this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>GitHub Repos</CardTitle>
            <CardDescription>Public repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repositories.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Score</CardTitle>
            <CardDescription>Completeness rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Repositories</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <ProjectCard key={repo.id} repository={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}