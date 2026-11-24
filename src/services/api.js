import * as FileSystem from 'expo-file-system/legacy';

const BASE_URL = 'http://10.131.64.87:5000/api';

// ========================================
// HELPER RESPONSE
// ========================================

const parseResponse = async (response) => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || 'Terjadi kesalahan pada server.'
    );
  }

  return result;
};

const getAuthHeaders = (accessToken) => {
  if (!accessToken) {
    throw new Error('Sesi login tidak ditemukan. Silakan login kembali.');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// ========================================
// ANIMAL API
// ========================================

export const getAnimals = async () => {
  const response = await fetch(`${BASE_URL}/animals`);
  const result = await parseResponse(response);

  return result.data || [];
};

export const getAnimalById = async (id) => {
  const response = await fetch(`${BASE_URL}/animals/${id}`);
  const result = await parseResponse(response);

  return result.data;
};

// ========================================
// ADMIN: TAMBAH HEWAN
// ========================================

export const createAdminAnimal = async (
  animalData,
  image,
  accessToken
) => {
  if (!image?.uri) {
    throw new Error('Foto hewan wajib dipilih.');
  }

  const mimeType = image.mimeType || 'image/jpeg';
  const parameters = {};

  Object.keys(animalData).forEach((key) => {
    parameters[key] = String(animalData[key]);
  });

  const response = await FileSystem.uploadAsync(
    `${BASE_URL}/animals/admin`,
    image.uri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType,
      parameters,
      headers: getAuthHeaders(accessToken),
    }
  );

  const result = JSON.parse(response.body);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      result.message || 'Gagal menambahkan data hewan.'
    );
  }

  return result;
};

// ========================================
// ADMIN: EDIT HEWAN
// ========================================

export const updateAdminAnimal = async (
  id,
  animalData,
  image,
  accessToken
) => {
  const url = `${BASE_URL}/animals/admin/${id}`;

  if (image?.uri) {
    const mimeType = image.mimeType || 'image/jpeg';
    const parameters = {};

    Object.keys(animalData).forEach((key) => {
      parameters[key] = String(animalData[key]);
    });

    const response = await FileSystem.uploadAsync(
      url,
      image.uri,
      {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        mimeType,
        parameters,
        headers: getAuthHeaders(accessToken),
      }
    );

    const result = JSON.parse(response.body);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        result.message || 'Gagal memperbarui data hewan.'
      );
    }

    return result;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animalData),
  });

  return parseResponse(response);
};

// ========================================
// ADMIN: HAPUS HEWAN
// ========================================

export const deleteAdminAnimal = async (id, accessToken) => {
  const response = await fetch(
    `${BASE_URL}/animals/admin/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    }
  );

  return parseResponse(response);
};

// ========================================
// SHELTER API
// ========================================

export const getShelters = async () => {
  const response = await fetch(`${BASE_URL}/shelters`);
  const result = await parseResponse(response);

  return result.data || [];
};

export const getShelterById = async (id) => {
  const response = await fetch(`${BASE_URL}/shelters/${id}`);
  const result = await parseResponse(response);

  return result.data;
};

// ========================================
// ADMIN: SHELTER API
// ========================================

export const getAdminShelters = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/shelters/admin`, {
    headers: getAuthHeaders(accessToken),
  });

  const result = await parseResponse(response);
  return result.data || [];
};

export const createAdminShelter = async (
  shelterData,
  image,
  accessToken
) => {
  const parameters = {};

  Object.keys(shelterData).forEach((key) => {
    parameters[key] = String(shelterData[key]);
  });

  let response;

  if (image?.uri) {
    response = await FileSystem.uploadAsync(
      `${BASE_URL}/shelters/admin`,
      image.uri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        mimeType: image.mimeType || 'image/jpeg',
        parameters,
        headers: getAuthHeaders(accessToken),
      }
    );

    const result = JSON.parse(response.body);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        result.message || 'Gagal menambahkan shelter.'
      );
    }

    return result;
  }

  const jsonResponse = await fetch(`${BASE_URL}/shelters/admin`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shelterData),
  });

  return parseResponse(jsonResponse);
};

export const updateAdminShelter = async (
  id,
  shelterData,
  image,
  accessToken
) => {
  const url = `${BASE_URL}/shelters/admin/${id}`;

  if (image?.uri) {
    const parameters = {};

    Object.keys(shelterData).forEach((key) => {
      parameters[key] = String(shelterData[key]);
    });

    const response = await FileSystem.uploadAsync(
      url,
      image.uri,
      {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        mimeType: image.mimeType || 'image/jpeg',
        parameters,
        headers: getAuthHeaders(accessToken),
      }
    );

    const result = JSON.parse(response.body);

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        result.message || 'Gagal memperbarui shelter.'
      );
    }

    return result;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shelterData),
  });

  return parseResponse(response);
};

export const deleteAdminShelter = async (id, accessToken) => {
  const response = await fetch(
    `${BASE_URL}/shelters/admin/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    }
  );

  return parseResponse(response);
};

// ========================================
// ADOPTION API
// ========================================

// User mengirim pengajuan dengan token autentikasi.
// Identitas pemohon ditentukan oleh backend dari token login.
export const createAdoptionRequest = async (
  adoptionData,
  accessToken
) => {
  const response = await fetch(`${BASE_URL}/adoptions`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adoptionData),
  });

  return parseResponse(response);
};

// Mengambil riwayat pengajuan milik user yang sedang login.
export const getAdoptionRequests = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/adoptions`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  });

  const result = await parseResponse(response);

  return result.data || [];
};

// ========================================
// ADMIN: ADOPTION MANAGEMENT
// ========================================

export const getAdminAdoptions = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/adoptions/admin`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  });

  return parseResponse(response);
};

export const updateAdminAdoptionStatus = async (
  id,
  status,
  accessToken
) => {
  const response = await fetch(
    `${BASE_URL}/adoptions/admin/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  return parseResponse(response);
};

export const deleteAdminAdoption = async (id, accessToken) => {
  const response = await fetch(
    `${BASE_URL}/adoptions/admin/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    }
  );

  return parseResponse(response);
};

// ========================================
// ADMIN: USER MANAGEMENT
// ========================================

export const getAdminUsers = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/users/admin`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  });

  return parseResponse(response);
};

export const updateUserRole = async (
  userId,
  role,
  accessToken
) => {
  const response = await fetch(
    `${BASE_URL}/users/admin/${userId}/role`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    }
  );

  return parseResponse(response);
};

// ========================================
// USER: UPLOAD PET
// ========================================

export const uploadPet = async (animalData, image, accessToken) => {
  if (!image?.uri) {
    throw new Error('Foto hewan wajib dipilih.');
  }

  const mimeType = image.mimeType || 'image/jpeg';
  const parameters = {};

  Object.keys(animalData).forEach((key) => {
    if (animalData[key] !== undefined && animalData[key] !== null) {
      parameters[key] = String(animalData[key]);
    }
  });

  const headers = accessToken ? getAuthHeaders(accessToken) : {};

  const response = await FileSystem.uploadAsync(
    `${BASE_URL}/animals/upload`,
    image.uri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType,
      parameters,
      headers,
    }
  );

  const result = JSON.parse(response.body);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(result.message || 'Gagal mengunggah data hewan.');
  }

  return result;
};
