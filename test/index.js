let HTMLConvertHandler;

async function start加載() {
	const convert = await OpenCC.Converter('hk', 'cn');
	const startNode = document.documentElement;
	HTMLConvertHandler = OpenCC.HTMLConverter(convert, startNode, 'zh-HK', 'zh-CN');
	output2.innerText = '加載完成';
}

async function start轉換() {
	HTMLConvertHandler.convert();
}

async function start恢復() {
	HTMLConvertHandler.restore();
}

function alert繁體() {
	output.innerText = '繁體';
}
