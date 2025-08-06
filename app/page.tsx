"use client"

import { useState, useEffect } from "react"
import { Calculator, Network, BookOpen, HelpCircle, Menu, X, Server, Shield, Globe, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CIDRResult {
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  firstUsableIP: string
  lastUsableIP: string
  totalHosts: number
  usableHosts: number
  networkBits: number
  hostBits: number
  totalBits: number
}

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("calculator")
  const [cidr, setCidr] = useState("10.0.0.0/16")
  const [result, setResult] = useState<CIDRResult | null>(null)
  const [bitsResult, setBitsResult] = useState<CIDRResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Calculate default CIDR on mount for bits visualization
    calculateBitsVisualization("10.0.0.0/16")
  }, [])

  const calculateBitsVisualization = async (cidrValue: string) => {
    try {
      const response = await fetch('/api/calculate-cidr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cidr: cidrValue }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setBitsResult(data)
        setError("")
      } else {
        setBitsResult(null)
        setError("Invalid CIDR notation")
      }
    } catch (err) {
      setBitsResult(null)
      setError("Invalid CIDR notation")
    }
  }

  const handleCidrChange = (value: string) => {
    setCidr(value)
    // Calculate bits visualization in real-time
    if (value.includes('/') && value.split('/').length === 2) {
      calculateBitsVisualization(value)
    } else {
      setBitsResult(null)
      setError("")
    }
  }

// Remove the calculateCIDRDefault function and update calculateCIDR:
  const calculateCIDR = async () => {
    try {
      setError("")
      const response = await fetch('/api/calculate-cidr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cidr }),
      })
      
      if (!response.ok) {
        throw new Error('Invalid CIDR notation')
      }
      
      const data = await response.json()
      setResult(data)
      setBitsResult(data) // Update bits result too
      setShowResults(true)
    } catch (err) {
      setError('Please enter a valid CIDR notation (e.g., 10.0.0.0/24)')
      setResult(null)
      setShowResults(false)
    }
  }

  const renderBitsVisualization = () => {
    if (!bitsResult) return null

    const bits = []
    for (let i = 0; i < 32; i++) {
      const isNetworkBit = i < bitsResult.networkBits
      bits.push(
        <div
          key={i}
          className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold border ${
            isNetworkBit 
              ? 'bg-blue-500 text-white border-blue-600' 
              : 'bg-orange-400 text-white border-orange-500'
          }`}
        >
          {isNetworkBit ? '1' : '0'}
        </div>
      )
    }
    return bits
  }

  const renderCalculatorSection = () => (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            CIDR Calculator
          </CardTitle>
          <p className="text-gray-600">Enter a CIDR notation to calculate network details</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              type="text"
              value={cidr}
              onChange={(e) => handleCidrChange(e.target.value)}
              placeholder="10.0.0.0/24"
              className="flex-1 text-lg p-3 border-2"
            />
            <Button onClick={calculateCIDR} className="px-8 py-3 text-lg">
              Calculate
            </Button>
          </div>
          
          {error && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CIDR Bits Visualization - Shows when typing */}
      {bitsResult && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>CIDR Bits Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 sm:grid-cols-16 lg:grid-cols-32 gap-1 mb-4 justify-center">
              {renderBitsVisualization()}
            </div>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                <span className="text-sm">Network Bits ({bitsResult.networkBits})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-400 mr-2"></div>
                <span className="text-sm">Host Bits ({bitsResult.hostBits})</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Bits</div>
                <div className="text-2xl font-bold">{bitsResult.totalBits}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Available Hosts</div>
                <div className="text-2xl font-bold text-green-600">
                  {bitsResult.totalHosts.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Usable IPs</div>
                <div className="text-2xl font-bold text-blue-600">
                  {bitsResult.usableHosts.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid - Only shown after calculate */}
      {showResults && result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Network Address</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{result.networkAddress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Broadcast Address</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{result.broadcastAddress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Subnet Mask</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{result.subnetMask}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">First Usable IP</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{result.firstUsableIP}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Last Usable IP</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{result.lastUsableIP}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Usable Hosts</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {result.usableHosts.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )

  const renderVPCGuideSection = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">VPC Networking Guide</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Master the fundamentals of Virtual Private Cloud networking with our comprehensive guide
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Network className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">VPC Basics</h3>
            <p className="text-gray-600 text-sm">Understanding virtual networks and isolation</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Server className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Subnets</h3>
            <p className="text-gray-600 text-sm">Public, private, and database subnets</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <p className="text-gray-600 text-sm">NACLs, security groups, and best practices</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connectivity</h3>
            <p className="text-gray-600 text-sm">Gateways, peering, and hybrid connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Network className="h-5 w-5 mr-2" />
              What is a VPC?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              A Virtual Private Cloud (VPC) is a logically isolated section of the cloud where you can launch resources in a virtual network that you define.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Complete control over your virtual networking environment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Selection of IP address ranges, subnets, and routing tables</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Configuration of network gateways and security settings</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              CIDR Block Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Proper CIDR block planning is crucial for scalable and efficient network design.
            </p>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-semibold text-blue-900">10.0.0.0/16</div>
                <div className="text-sm text-blue-700">65,534 hosts - Good for large environments</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-semibold text-green-900">10.0.0.0/24</div>
                <div className="text-sm text-green-700">254 hosts - Perfect for small subnets</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-semibold text-purple-900">10.0.0.0/8</div>
                <div className="text-sm text-purple-700">16M+ hosts - Enterprise scale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            VPC Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">✅ Do's</h4>
              <ul className="space-y-2 text-sm">
                <li>• Plan your IP address space carefully</li>
                <li>• Use multiple Availability Zones</li>
                <li>• Implement proper security groups</li>
                <li>• Monitor network traffic and costs</li>
                <li>• Use private subnets for databases</li>
                <li>• Enable VPC Flow Logs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-red-700">❌ Don'ts</h4>
              <ul className="space-y-2 text-sm">
                <li>• Don't use overlapping CIDR blocks</li>
                <li>• Don't put everything in public subnets</li>
                <li>• Don't ignore security group rules</li>
                <li>• Don't forget about NAT Gateway costs</li>
                <li>• Don't use default VPCs in production</li>
                <li>• Don't skip network monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInterviewSection = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">VPC Interview Q&A</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Common VPC and networking questions asked in cloud engineering interviews
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left">
            What is the difference between a public and private subnet?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 space-y-3">
            <p><strong>Public Subnet:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Has a route to an Internet Gateway (IGW)</li>
              <li>Resources can have public IP addresses</li>
              <li>Direct internet connectivity for inbound and outbound traffic</li>
              <li>Typically used for web servers, load balancers</li>
            </ul>
            <p><strong>Private Subnet:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>No direct route to Internet Gateway</li>
              <li>Uses NAT Gateway/Instance for outbound internet access</li>
              <li>More secure, isolated from direct internet access</li>
              <li>Typically used for databases, application servers</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left">
            How do you calculate the number of available IP addresses in a CIDR block?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 space-y-3">
            <p>The formula is: <strong>2^(32 - prefix length) - 2</strong></p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Example: 10.0.0.0/24</strong></p>
              <p>• Prefix length: 24</p>
              <p>• Host bits: 32 - 24 = 8</p>
              <p>• Total addresses: 2^8 = 256</p>
              <p>• Usable addresses: 256 - 2 = 254</p>
              <p className="text-sm text-gray-600">(Subtract 2 for network and broadcast addresses)</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left">
            What is the difference between Security Groups and NACLs?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Security Groups</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Instance-level firewall</li>
                  <li>Stateful (return traffic allowed)</li>
                  <li>Allow rules only</li>
                  <li>Evaluated before traffic reaches instance</li>
                  <li>Can reference other security groups</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Network ACLs</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Subnet-level firewall</li>
                  <li>Stateless (must allow return traffic)</li>
                  <li>Allow and deny rules</li>
                  <li>Processed in rule number order</li>
                  <li>Additional layer of security</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-left">
            When would you use VPC Peering vs Transit Gateway?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 space-y-3">
            <p><strong>VPC Peering:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Simple 1-to-1 connection between VPCs</li>
              <li>Lower cost for simple scenarios</li>
              <li>No transitive routing</li>
              <li>Good for connecting 2-3 VPCs</li>
            </ul>
            <p><strong>Transit Gateway:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Hub-and-spoke model for multiple VPCs</li>
              <li>Supports transitive routing</li>
              <li>Better for complex, scalable architectures</li>
              <li>Can connect to on-premises networks</li>
              <li>Higher cost but more features</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-left">
            How do you troubleshoot connectivity issues in a VPC?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 space-y-3">
            <p><strong>Step-by-step troubleshooting approach:</strong></p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Check Route Tables:</strong> Ensure proper routes exist for traffic flow</li>
              <li><strong>Verify Security Groups:</strong> Check inbound/outbound rules</li>
              <li><strong>Review NACLs:</strong> Ensure subnet-level rules allow traffic</li>
              <li><strong>Validate DNS Resolution:</strong> Check if hostnames resolve correctly</li>
              <li><strong>Test Network Connectivity:</strong> Use ping, telnet, or traceroute</li>
              <li><strong>Check VPC Flow Logs:</strong> Analyze traffic patterns and rejections</li>
              <li><strong>Verify Gateway Configuration:</strong> IGW, NAT Gateway, VPN Gateway</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger className="text-left">
            What are the different types of VPC endpoints?
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 space-y-3">
            <p><strong>Interface Endpoints (PrivateLink):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Uses Elastic Network Interface (ENI)</li>
              <li>Supports most AWS services</li>
              <li>Charged per hour and per GB processed</li>
              <li>Can be accessed from on-premises</li>
            </ul>
            <p><strong>Gateway Endpoints:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Only for S3 and DynamoDB</li>
              <li>Uses route table entries</li>
              <li>No additional charges</li>
              <li>Cannot be accessed from on-premises</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Quick Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Interview Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-700">Technical Preparation</h4>
              <ul className="space-y-2 text-sm">
                <li>• Practice CIDR calculations manually</li>
                <li>• Understand OSI model and TCP/IP</li>
                <li>• Know AWS networking services well</li>
                <li>• Practice drawing network diagrams</li>
                <li>• Understand hybrid connectivity options</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Communication Tips</h4>
              <ul className="space-y-2 text-sm">
                <li>• Explain your thought process clearly</li>
                <li>• Ask clarifying questions</li>
                <li>• Use real-world examples</li>
                <li>• Discuss trade-offs and alternatives</li>
                <li>• Mention security and cost considerations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Samarth's CIDR Portal</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Advanced VPC Networking Tools</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveSection("calculator")}
                className={`font-medium flex items-center ${activeSection === "calculator" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                <Calculator className="h-4 w-4 mr-1" />
                Calculator
              </button>
              <button 
                onClick={() => setActiveSection("guide")}
                className={`flex items-center ${activeSection === "guide" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                VPC Guide
              </button>
              <button 
                onClick={() => setActiveSection("interview")}
                className={`flex items-center ${activeSection === "interview" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Interview Q&A
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    setActiveSection("calculator")
                    setIsMenuOpen(false)
                  }}
                  className={`text-left font-medium flex items-center ${activeSection === "calculator" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </button>
                <button 
                  onClick={() => {
                    setActiveSection("guide")
                    setIsMenuOpen(false)
                  }}
                  className={`text-left flex items-center ${activeSection === "guide" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  VPC Guide
                </button>
                <button 
                  onClick={() => {
                    setActiveSection("interview")
                    setIsMenuOpen(false)
                  }}
                  className={`text-left flex items-center ${activeSection === "interview" ? "text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Interview Q&A
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "calculator" && renderCalculatorSection()}
        {activeSection === "guide" && renderVPCGuideSection()}
        {activeSection === "interview" && renderInterviewSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <Network className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h3 className="text-xl font-bold">Samarth's CIDR Portal</h3>
                <p className="text-gray-400">Advanced VPC Networking Tools</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-400 mb-2">Contact</p>
              <p className="text-xl font-bold">9604156915</p>
            </div>
            
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm">
                © 2024 Samarth's CIDR Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
