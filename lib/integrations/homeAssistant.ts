// Home Assistant Integration
// This is a sample implementation showing how smart home integration would work

export interface Device {
  entity_id: string
  state: string
  attributes: {
    friendly_name: string
    device_class?: string
    unit_of_measurement?: string
    brightness?: number
    temperature?: number
    [key: string]: any
  }
}

export interface HomeAssistantConfig {
  url: string
  token: string
}

export class HomeAssistant {
  private config: HomeAssistantConfig

  constructor(config: HomeAssistantConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    // In a real implementation, this would make actual HTTP requests
    console.log(`[HomeAssistant] ${method} ${this.config.url}${endpoint}`, data)
    
    // Mock response for demo
    return { ok: true, json: () => Promise.resolve({}) }
  }

  async getStates(): Promise<Device[]> {
    // Mock devices for demo
    return [
      {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {
          friendly_name: 'Living Room Light',
          brightness: 180,
          device_class: 'light'
        }
      },
      {
        entity_id: 'light.bedroom',
        state: 'off',
        attributes: {
          friendly_name: 'Bedroom Light',
          brightness: 0,
          device_class: 'light'
        }
      },
      {
        entity_id: 'climate.thermostat',
        state: '72',
        attributes: {
          friendly_name: 'Thermostat',
          temperature: 72,
          unit_of_measurement: '°F',
          device_class: 'temperature'
        }
      },
      {
        entity_id: 'switch.coffee_maker',
        state: 'off',
        attributes: {
          friendly_name: 'Coffee Maker',
          device_class: 'switch'
        }
      }
    ]
  }

  async callService(domain: string, service: string, data?: any): Promise<any> {
    const endpoint = `/api/services/${domain}/${service}`
    return this.makeRequest(endpoint, 'POST', data)
  }

  async turnOn(entityId: string, options?: { brightness?: number }): Promise<boolean> {
    await this.callService('homeassistant', 'turn_on', {
      entity_id: entityId,
      ...options
    })
    return true
  }

  async turnOff(entityId: string): Promise<boolean> {
    await this.callService('homeassistant', 'turn_off', {
      entity_id: entityId
    })
    return true
  }

  async setBrightness(entityId: string, brightness: number): Promise<boolean> {
    await this.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: Math.max(0, Math.min(255, brightness))
    })
    return true
  }

  async setTemperature(entityId: string, temperature: number): Promise<boolean> {
    await this.callService('climate', 'set_temperature', {
      entity_id: entityId,
      temperature
    })
    return true
  }
}

// Initialize with mock config
const homeAssistant = new HomeAssistant({
  url: process.env.HOME_ASSISTANT_URL || 'http://localhost:8123',
  token: process.env.HOME_ASSISTANT_TOKEN || 'mock-token'
})

// Helper functions for natural language processing
export const parseHomeCommand = (message: string) => {
  const lowerMessage = message.toLowerCase()
  
  // Light controls
  if (lowerMessage.includes('light')) {
    if (lowerMessage.includes('turn on') || lowerMessage.includes('on')) {
      return { action: 'turn_on', device_type: 'light' }
    }
    if (lowerMessage.includes('turn off') || lowerMessage.includes('off')) {
      return { action: 'turn_off', device_type: 'light' }
    }
    if (lowerMessage.includes('dim') || lowerMessage.includes('brightness')) {
      const brightnessMatch = lowerMessage.match(/(\d+)%?/)
      const brightness = brightnessMatch ? parseInt(brightnessMatch[1]) : 50
      return { action: 'dim', device_type: 'light', value: brightness }
    }
  }
  
  // Temperature controls
  if (lowerMessage.includes('temperature') || lowerMessage.includes('thermostat')) {
    const tempMatch = lowerMessage.match(/(\d+)/)
    const temperature = tempMatch ? parseInt(tempMatch[1]) : null
    if (temperature) {
      return { action: 'set_temperature', device_type: 'climate', value: temperature }
    }
  }
  
  // General device controls
  if (lowerMessage.includes('turn on')) {
    return { action: 'turn_on', device_type: 'general' }
  }
  
  if (lowerMessage.includes('turn off')) {
    return { action: 'turn_off', device_type: 'general' }
  }
  
  return null
}

export const findDevice = (devices: Device[], query: string): Device | null => {
  const lowerQuery = query.toLowerCase()
  
  return devices.find(device => {
    const name = device.attributes.friendly_name.toLowerCase()
    const entityId = device.entity_id.toLowerCase()
    
    return name.includes(lowerQuery) || 
           entityId.includes(lowerQuery) ||
           lowerQuery.includes(name.replace(/\s+/g, ''))
  }) || null
}

export const run = async (action: string, params?: any) => {
  try {
    const devices = await homeAssistant.getStates()
    
    switch (action) {
      case 'list_devices':
        return {
          success: true,
          data: devices,
          message: `Found ${devices.length} connected devices.`
        }
      
      case 'turn_on':
        const deviceToTurnOn = findDevice(devices, params?.device || 'light')
        if (deviceToTurnOn) {
          await homeAssistant.turnOn(deviceToTurnOn.entity_id, params?.options)
          return {
            success: true,
            message: `Turned on ${deviceToTurnOn.attributes.friendly_name}.`
          }
        }
        return {
          success: false,
          message: 'Device not found.'
        }
      
      case 'turn_off':
        const deviceToTurnOff = findDevice(devices, params?.device || 'light')
        if (deviceToTurnOff) {
          await homeAssistant.turnOff(deviceToTurnOff.entity_id)
          return {
            success: true,
            message: `Turned off ${deviceToTurnOff.attributes.friendly_name}.`
          }
        }
        return {
          success: false,
          message: 'Device not found.'
        }
      
      case 'set_brightness':
        const lightDevice = findDevice(devices, params?.device || 'light')
        if (lightDevice && lightDevice.entity_id.startsWith('light.')) {
          await homeAssistant.setBrightness(lightDevice.entity_id, params?.brightness || 50)
          return {
            success: true,
            message: `Set ${lightDevice.attributes.friendly_name} brightness to ${params?.brightness || 50}%.`
          }
        }
        return {
          success: false,
          message: 'Light device not found.'
        }
      
      case 'set_temperature':
        const thermostat = findDevice(devices, 'thermostat')
        if (thermostat) {
          await homeAssistant.setTemperature(thermostat.entity_id, params?.temperature)
          return {
            success: true,
            message: `Set thermostat to ${params?.temperature}°F.`
          }
        }
        return {
          success: false,
          message: 'Thermostat not found.'
        }
      
      default:
        return {
          success: false,
          message: 'Unknown home automation action.'
        }
    }
  } catch (error) {
    console.error('Home Assistant error:', error)
    return {
      success: false,
      message: 'Error communicating with home automation system.'
    }
  }
} 