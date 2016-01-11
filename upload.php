<?php
class Upload
{
    /**
     * @var string 图片默认存放路径
     */
	private $save_path = 'upload/';

    /**
     * @var string 图片显示网址
     */
    private $http_path = 'upload/';

    /**
     * 标准输出规则
     * @param $code
     * @param $message
     * @param array $items
     */
    private function showMessage($code, $message, $items = [])
    {
        echo json_encode([
            'code'  => $code,
            'msg'   => $message,
            'items' => $items
        ]);
        exit;
    }

    /**
     * 构造函数，检测目录
     */
    public function __construct()
    {
        $this->save_path = __DIR__ . '/' . $this->save_path;
        clearstatcache();
        if (!is_dir($this->save_path)) {
            $this->showMessage(0, $this->save_path . '不存在');
        } else if (is_writable($this->save_path)) {
            $this->makeDir($this->save_path);
        } else {
            $this->showMessage(0, '目录权限不足');
        }
    }

    /**
     * 获取文件存储路径
     * @param $file
     * @param $extension
     * @return string
     */
    private function getFilePath($file, $extension)
    {
        return $this->save_path . md5($file) . $extension;
    }

    /**
     * 循环生成目录
     * @param $path
     * @return bool
     */
    public function makeDir($path){
        return is_dir($path) || ($this->makeDir(dirname($path)) && mkdir($path, 0777));
    }

    /**
     * 上传图片实现
     */
    public function start()
    {
        $file = $_POST['file'];
        list($type, $file) = explode(',', $file);
        preg_match('/(jpeg|png|gif)/', $type, $extension);
        if (!isset($extension[1])) {
            $this->showMessage(0, '图片格式错误');
        }
        if ($extension[1] == 'jpeg') {
            $extension[1] = 'jpg';
        }
        $path = $this->getFilePath($file, $extension[1]);
        if (file_put_contents($path, base64_decode($file), true)) {
            $this->showMessage(1, '上传成功', str_ireplace($this->save_path, $this->http_path, $path));
        } else {
            $this->showMessage(0, '文件写入失败，请检查目录权限');
        }
    }
}

$upload = new Upload();
$upload->start();