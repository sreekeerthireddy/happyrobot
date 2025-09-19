const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const geocoding = require('@aashari/nodejs-geocoding');

async function main() {
  const loads = [
    {
      origin: 'Chicago, IL',
      destination: 'Atlanta, GA',
      pickup_datetime: new Date('2024-10-15T08:00:00Z'),
      delivery_datetime: new Date('2024-10-16T18:00:00Z'),
      equipment_type: 'Dry Van',
      loadboard_rate: 2850.5,
      weight: 45000.5,
      commodity_type: 'Electronics',
      num_of_pieces: 12,
      miles: 717.2,
      dimensions: "53' x 8'6\" x 13'6\"",
      notes: 'Fragile items, handle with care',
    },
    {
      origin: 'Los Angeles, CA',
      destination: 'Phoenix, AZ',
      pickup_datetime: new Date('2024-10-16T06:00:00Z'),
      delivery_datetime: new Date('2024-10-16T22:00:00Z'),
      equipment_type: 'Flatbed',
      loadboard_rate: 1200.0,
      weight: 38000.0,
      commodity_type: 'Construction Materials',
      num_of_pieces: 8,
      miles: 373.5,
      dimensions: "48' x 8'6\"",
      notes: 'Tarps required',
    },
    {
      origin: 'Miami, FL',
      destination: 'New York, NY',
      pickup_datetime: new Date('2024-10-17T10:00:00Z'),
      delivery_datetime: new Date('2024-10-19T14:00:00Z'),
      equipment_type: 'Reefer',
      loadboard_rate: 4200.75,
      weight: 42500.25,
      commodity_type: 'Frozen Foods',
      num_of_pieces: 25,
      miles: 1281.3,
      dimensions: "53' x 8'6\" x 13'6\"",
      notes: 'Temperature: -10°F to 0°F',
    },
    {
      origin: 'Dallas, TX',
      destination: 'Denver, CO',
      pickup_datetime: new Date('2024-10-18T12:00:00Z'),
      delivery_datetime: new Date('2024-10-19T16:00:00Z'),
      equipment_type: 'Dry Van',
      loadboard_rate: 1850.0,
      weight: 35000.0,
      commodity_type: 'Clothing',
      num_of_pieces: 45,
      miles: 641.8,
      dimensions: '',
      notes: '',
    },
    {
      origin: 'Seattle, WA',
      destination: 'Portland, OR',
      pickup_datetime: new Date('2024-10-19T09:00:00Z'),
      delivery_datetime: new Date('2024-10-19T15:00:00Z'),
      equipment_type: 'Flatbed',
      loadboard_rate: 450.25,
      weight: 28000.0,
      commodity_type: 'Lumber',
      num_of_pieces: 15,
      miles: 173.1,
      dimensions: "48' x 8'6\"",
      notes: 'Easy load/unload',
    },
  ];

  async function geocode(address) {
    const results = await geocoding.encode(address);
    if (!results || results.length === 0) {
      throw new Error(`Unable to geocode: ${address}`);
    }
    const { latitude: lat, longitude: lon } = results[0];
    return { lat, lon };
  }

  // Populate lat/lng fields on each load
  for (const load of loads) {
    const originCoords = await geocode(load.origin);
    load.originLat = originCoords.lat;
    load.originLng = originCoords.lon;
    const destCoords = await geocode(load.destination);
    load.destinationLat = destCoords.lat;
    load.destinationLng = destCoords.lon;
  }

  const result = await prisma.load.createMany({
    data: loads,
  });
  console.log(`Created ${result.count} loads`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
