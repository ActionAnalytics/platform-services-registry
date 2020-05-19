//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Created by Jason Leach on 2020-04-27.
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Request, Response } from 'express';
import config from '../config';
import DataManager from '../db';
import { validateObjProps } from '../libs/utils';

export const fetchAllProjectProfiles = async (req: Request, res: Response): Promise<void> => {
  const dm = new DataManager(config);
  const { ProfileModel } = dm;

  try {
    const results = await ProfileModel.findAll();

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable fetch all project profiles';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProjectProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const dm = new DataManager(config);
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const results = await ProfileModel.findById(Number(profileId));

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable fetch project profile with ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const createProjectProfile = async (
  { body }: { body: any }, res: Response
): Promise<void> => {
  const dm = new DataManager(config);
  const { ProfileModel } = dm;

  const rv = validateObjProps(ProfileModel.requiredFields, body);
  if (rv) {
    throw rv;
  }

  try {
    const results = await ProfileModel.create(body);

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable create new project profile';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProjectProfile = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const dm = new DataManager(config);
  const { ProfileModel } = dm;
  const { profileId } = params;
  const {
    name,
    description,
    categoryId,
    busOrgId,
    active,
    criticalSystem,
  } = body;
  const aBody = {
    name,
    description,
    categoryId,
    busOrgId,
    active,
    criticalSystem,
  };

  const rv = validateObjProps(ProfileModel.requiredFields, aBody);
  if (rv) {
    throw rv;
  }

  try {
    const results = await ProfileModel.update(profileId, aBody);

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable update project profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const archiveProjectProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const dm = new DataManager(config);
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    await ProfileModel.delete(profileId);

    res.status(204).end();
  } catch (err) {
    const message = 'Unable create new project profile';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};