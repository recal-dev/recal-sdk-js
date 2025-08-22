import { describe, test, beforeAll, afterAll, expect} from "bun:test"
import { TestClient } from "../helpers/test-client"

describe("Organization Integration Tests", () => {
  const testClient = new TestClient();

  const primaryOrgSlug = testClient.generateTestId("org", "primary-org")
  const primaryOrgName = testClient.generateTestId("org", "Primary Org")

  const secondaryOrgSlug = testClient.generateTestId("org", "secondary-org")
  const secondaryOrgName = testClient.generateTestId("org", "Secondary Org")

  beforeAll(async () => {
    await testClient.setup()
  })

  afterAll(async () => {
    await testClient.teardown("org")
  })

  test("should create an organization and return it", async () => {
    const org = await testClient.client.organization.create(primaryOrgSlug, primaryOrgName)

    expect(org).toBeDefined()
    expect(org.slug).toBe(primaryOrgSlug)
    expect(org.name).toBe(primaryOrgName)
    expect(org.createdAt).toBeInstanceOf(Date)
  })

  test("should retrieve an organization by slug", async () => {
    const org = await testClient.client.organization.get(primaryOrgSlug)

    expect(org).toBeDefined()
    expect(org.slug).toBe(primaryOrgSlug)
    expect(org.name).toBe(primaryOrgName)
    expect(org.createdAt).toBeInstanceOf(Date)
  })

  test("should update an organization", async () => {
    const org = await testClient.client.organization.create(secondaryOrgSlug, secondaryOrgName)

    const updatedSlug = testClient.generateTestId("org", "updated-org")
    const updatedName = testClient.generateTestId("org", "Updated Org")

    const updatedOrg = await testClient.client.organization.update(org.slug, {
      slug: updatedSlug,
      name: updatedName
    })

    expect(updatedOrg).toBeDefined()
    expect(updatedOrg.slug).toBe(updatedSlug)
    expect(updatedOrg.name).toBe(updatedName)
    expect(updatedOrg.createdAt).toBeInstanceOf(Date)
  })

  test("should list all organizations", async () => {
    const orgs = await testClient.client.organization.listAll()

    expect(orgs).toBeDefined()
    expect(Array.isArray(orgs)).toBe(true)
    expect(orgs.length).toBeGreaterThan(0)
    
    const orgSlugs = orgs.map(org => org.slug)
    expect(orgSlugs).toContain(primaryOrgSlug)
    
    for (const org of orgs) {
      expect(org.slug).toBeDefined()
      expect(typeof org.slug).toBe('string')
      expect(org.createdAt).toBeInstanceOf(Date)
    }
  })

  test("should delete an organization", async () => {
    const tempSlug = testClient.generateTestId("org", "temp-org")
    const tempName = testClient.generateTestId("org", "Temp Org")
    
    const tempOrg = await testClient.client.organization.create(tempSlug, tempName)
    expect(tempOrg.slug).toBe(tempSlug)
    
    const deletedOrg = await testClient.client.organization.delete(tempSlug)
    
    expect(deletedOrg).toBeDefined()
    expect(deletedOrg.slug).toBe(tempSlug)
    expect(deletedOrg.name).toBe(tempName)
  })

})