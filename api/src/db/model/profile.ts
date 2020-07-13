import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface ProjectProfile extends CommonFields {
  name: string,
  description: string,
  busOrgId: number,
  userId: number,
  active?: boolean,
  prioritySystem?: boolean,
  criticalSystem?: boolean,
}

export default class ProfileModel extends Model {
  table: string = 'profile';
  requiredFields: string[] = [
    'name',
    'description',
    'busOrgId',
    'prioritySystem',
    'userId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: ProjectProfile): Promise<ProjectProfile> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (name, description, bus_org_id, priority_system,
            critical_system, user_id)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.busOrgId,
        data.prioritySystem ? data.prioritySystem : false,
        data.criticalSystem ? data.criticalSystem : false,
        data.userId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(profileId, data: ProjectProfile): Promise<ProjectProfile> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, description = $2, bus_org_id = $3,
            active = $4, priority_system = $5, critical_system = $6
          WHERE id = ${profileId}
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(profileId);
      const aData = { ...record, ...data };
      query.values = [
        aData.name,
        aData.description,
        aData.busOrgId,
        aData.active,
        aData.criticalSystem,
        aData.prioritySystem,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async delete(profileId): Promise<ProjectProfile> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = ${profileId}
          RETURNING *;
      `,
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async addContactToProfile(profileId: number, contactId: number): Promise<void> {
    const values: any[] = [];
    const table = 'profile_contact';
    const query = {
      text: `
        INSERT INTO ${table}
          (profile_id, contact_id)
          VALUES ($1, $2) RETURNING *;`,
      values,
    };

    try {
      query.values = [
        profileId,
        contactId,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to link contact ${contactId} to profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
