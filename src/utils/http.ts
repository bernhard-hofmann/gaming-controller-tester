const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

const get = async (url: string, params: any = {}) => {
    const response = await fetch(url, { ...params, headers });
    return await response.json();
};

const post = async (url: string, data: any = {}, params: any = {}) => {
    const response = await fetch(url, {
        headers,
        method: 'POST',
        body: JSON.stringify(data),
        ...params,
    });
    return await response.json();
};

const put = async (url: string, data: any = {}, params: any = {}) => {
    const response = await fetch(url, {
        headers,
        method: 'PUT',
        body: JSON.stringify(data),
        ...params,
    });
    return await response.json();
};

const del = async (url: string, params: any = {}) => {
    const response = await fetch(url, { headers, method: 'DELETE', ...params, });
    return await response.json();
};

const patch = async (url: string, data: any = {}, params: any = {}) => {
    const response = await fetch(url, {
        headers,
        method: 'PATCH',
        body: JSON.stringify(data),
        ...params,
    });
    return await response.json();
};

export { get, post, put, del, patch };
