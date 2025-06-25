const express = require('express');
const OSS = require('ali-oss');
const cors = require('cors');
const app = express();

// 添加 CORS 中间件
app.use(cors());

const config = {
  // 阿里云的accessKeyId和accessKeySecret
  accessKeyId: '',
  accessKeySecret: '',
  // 阿里云的bucket
  bucket: '',
}
const client = new OSS (config);

app.get('/api/oss/signature',async (req, res) => {
try {
  const date = new Date();
  // 设置签名的有效期，单位为秒。
  date.setSeconds(date.getSeconds() + 3600);
  const policy = {
    expiration: date.toISOString(),
    conditions: [
      // 设置上传文件的大小限制。
      ["content-length-range", 0, 1048576000],
      // 限制可上传的Bucket。
      { bucket: client.options.bucket },
    ],
  };
  const formData = await client.calculatePostSignature(policy);
  const host = `http://${config.bucket}.${
    (await client.getBucketLocation()).location
  }.aliyuncs.com`.toString();
  const params = {
    policy: formData.policy,
    signature: formData.Signature,
    ossAccessKeyId: formData.OSSAccessKeyId,
    host,
  };
  res.json(params);

} catch (error) {
  console.log(error);
  res.status(500).json({ error: 'Failed to generate OSS signature' });
}
});

// 设置端口
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});