import { siteConfig } from "./site-config";
import { UAParser } from 'ua-parser-js';

interface ClientInfo {
    siteName: string;
    realIp: string;
    socketIp: string;
    forwardIp: string;
    clientIp: string;
    referrer: string;
    host: string;
    protocol: string;
    domain: string;
    url: string;
    userAgentString: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string | undefined;
    deviceVendor: string | undefined;
    deviceModel: string | undefined;
    sharedHost: string;
    configSite: string;
    configOrg: string;
    multipart?: boolean;
    customer?: {
        phone: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
    };
}


export const getRequestInfo = async (req: any) => {
    if (!req) return {};

    const forwardIp = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const protocol = req.headers['X-Forwarded-Proto'] || req.headers['x-forwarded-proto'] || req['protocol'];
    const host = req.headers['X-Forwarded-Host'] || req.headers['x-forwarded-host'] || req.headers['host'];
    const connectionIp = req.headers['DO-Connecting-IP']
    const socketIp = req.socket?.remoteAddress || '';
    const clientIp = req.headers['X-Real-IP'] || req.headers['x-real-ip'] || req.connection?.remoteAddress;
    const realIp = connectionIp || forwardIp || clientIp;
    const url = req.url

    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();
    const browser = result.browser.name;
    const browserVersion = result.browser.version;
    const os = result.os.name;
    const osVersion = result.os.version;
    const deviceType = result.device.type;
    const deviceVendor = result.device.vendor;
    const deviceModel = result.device.model;

    const referrer = req.headers.referer || '';
    const domain = req.headers.host;
    const siteName = siteConfig.siteName
    return { siteName, realIp, socketIp, forwardIp, clientIp, referrer, host, protocol, domain, url, userAgentString, browser, browserVersion, os, osVersion, deviceType, deviceVendor, deviceModel, sharedHost: siteConfig.domainAsOrg ? siteConfig.orgId : '', configSite: siteConfig.siteName, configOrg: siteConfig.orgId };
}




const validIPAddressCheck = (v4OrV6Ip: string) => {
    if (v4OrV6Ip) {
        const v4IpPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        const v6IpPattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return v4IpPattern.test(v4OrV6Ip) || v6IpPattern.test(v4OrV6Ip);
    }
    return false;

}

