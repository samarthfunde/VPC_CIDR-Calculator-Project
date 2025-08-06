import { NextRequest, NextResponse } from 'next/server'

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

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.')
}

function calculateCIDR(cidr: string): CIDRResult {
  const [ipAddress, prefixLength] = cidr.split('/')
  
  if (!ipAddress || !prefixLength) {
    throw new Error('Invalid CIDR format')
  }

  const prefix = parseInt(prefixLength)
  if (prefix < 0 || prefix > 32) {
    throw new Error('Invalid prefix length')
  }

  // Validate IP address
  const ipParts = ipAddress.split('.')
  if (ipParts.length !== 4 || ipParts.some(part => {
    const num = parseInt(part)
    return isNaN(num) || num < 0 || num > 255
  })) {
    throw new Error('Invalid IP address')
  }

  const networkBits = prefix
  const hostBits = 32 - prefix
  const totalBits = 32

  // Calculate subnet mask
  const subnetMaskNum = (0xFFFFFFFF << (32 - prefix)) >>> 0
  const subnetMask = numberToIp(subnetMaskNum)

  // Calculate network address
  const ipNum = ipToNumber(ipAddress)
  const networkNum = (ipNum & subnetMaskNum) >>> 0
  const networkAddress = numberToIp(networkNum)

  // Calculate broadcast address
  const broadcastNum = (networkNum | (0xFFFFFFFF >>> prefix)) >>> 0
  const broadcastAddress = numberToIp(broadcastNum)

  // Calculate first and last usable IPs
  const firstUsableNum = networkNum + 1
  const lastUsableNum = broadcastNum - 1
  const firstUsableIP = numberToIp(firstUsableNum)
  const lastUsableIP = numberToIp(lastUsableNum)

  // Calculate host counts
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = Math.max(0, totalHosts - 2) // Subtract network and broadcast addresses

  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    firstUsableIP,
    lastUsableIP,
    totalHosts,
    usableHosts,
    networkBits,
    hostBits,
    totalBits
  }
}

export async function POST(request: NextRequest) {
  try {
    const { cidr } = await request.json()
    
    if (!cidr) {
      return NextResponse.json({ error: 'CIDR is required' }, { status: 400 })
    }

    const result = calculateCIDR(cidr)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid CIDR notation' },
      { status: 400 }
    )
  }
}
