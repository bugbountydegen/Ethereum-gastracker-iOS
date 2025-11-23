// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: fire;
const widget = new ListWidget()

const gasData = await fetchGasPrices()

await createWidget()

// used for debugging if script runs inside the app
if (!config.runsInWidget) {
	await widget.presentSmall()
}

widget.setPadding(10, 10, 10, 10)
widget.url = 'https://etherscan.io/gastracker'

Script.setWidget(widget)
Script.complete()

// build the content of the widget
async function createWidget() {

	let line1, line2, line3
	let icon = widget.addStack()

	const ethIcon = await getImage('ethereum')
	const ethImg = icon.addImage(ethIcon)
	ethImg.imageSize = new Size(30, 30)

	icon.layoutHorizontally()
	icon.addSpacer(8)

	let iconRow = icon.addStack()
	iconRow.layoutVertically()

	let iconText = iconRow.addStack()
	line1 = iconText.addText("Gas Tracker")
	line1.font = Font.mediumRoundedSystemFont(13)

	line2 = widget.addText("by SmartAuditor.AI")
	line2.font = Font.lightRoundedSystemFont(11)
	line2.leftAlignText()

	widget.addSpacer(10)

	// Low Gas Price
	let rowLow = widget.addStack()
	rowLow.layoutHorizontally()
	
	let lowLabel = rowLow.addText("Low: ")
	lowLabel.font = Font.mediumRoundedSystemFont(14)
	lowLabel.textColor = new Color('#22c55e')
	
	let lowValue = rowLow.addText(parseFloat(gasData.SafeGasPrice).toFixed(3) + " gwei")
	lowValue.font = Font.regularMonospacedSystemFont(14)
	lowValue.textColor = new Color('#22c55e')

	widget.addSpacer(4)

	// Average Gas Price
	let rowAvg = widget.addStack()
	rowAvg.layoutHorizontally()
	
	let avgLabel = rowAvg.addText("Avg: ")
	avgLabel.font = Font.mediumRoundedSystemFont(14)
	avgLabel.textColor = new Color('#eab308')
	
	let avgValue = rowAvg.addText(parseFloat(gasData.ProposeGasPrice).toFixed(3) + " gwei")
	avgValue.font = Font.regularMonospacedSystemFont(14)
	avgValue.textColor = new Color('#eab308')

	widget.addSpacer(4)

	// High Gas Price
	let rowHigh = widget.addStack()
	rowHigh.layoutHorizontally()
	
	let highLabel = rowHigh.addText("High: ")
	highLabel.font = Font.mediumRoundedSystemFont(14)
	highLabel.textColor = new Color('#ef4444')
	
	let highValue = rowHigh.addText(parseFloat(gasData.FastGasPrice).toFixed(3) + " gwei")
	highValue.font = Font.regularMonospacedSystemFont(14)
	highValue.textColor = new Color('#ef4444')

	widget.addSpacer(8)

	// Base Fee
	if (gasData.suggestBaseFee) {
		let rowBase = widget.addStack()
		rowBase.layoutHorizontally()
		
		let baseLabel = rowBase.addText("Base: ")
		baseLabel.font = Font.lightRoundedSystemFont(12)
		baseLabel.textColor = Color.gray()
		
		let baseValue = rowBase.addText(parseFloat(gasData.suggestBaseFee).toFixed(3) + " gwei")
		baseValue.font = Font.lightMonospacedSystemFont(12)
		baseValue.textColor = Color.gray()
	}

	// Last update time
	let timeRow = widget.addStack()
	timeRow.layoutHorizontally()
	
	let timeLabel = timeRow.addText("Updated: ")
	timeLabel.font = Font.lightRoundedSystemFont(11)
	timeLabel.textColor = Color.gray()
	
	let updateTime = timeRow.addDate(new Date())
	updateTime.font = Font.lightMonospacedSystemFont(11)
	updateTime.textColor = Color.gray()
	updateTime.applyRelativeStyle()
}

// fetches the gas prices from Etherscan API
async function fetchGasPrices() {
	// Using Etherscan's v2 API with Ethereum mainnet (chainid=1)
	// Get a free API key from etherscan.io/apis
	let url = 'https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle'
	
	try {
		const req = new Request(url)
		const apiResult = await req.loadJSON()
		
		if (apiResult.status === "1" && apiResult.result) {
			return apiResult.result
		} else {
			// Fallback values if API fails
			return {
				SafeGasPrice: "N/A",
				ProposeGasPrice: "N/A",
				FastGasPrice: "N/A",
				suggestBaseFee: "N/A"
			}
		}
	} catch (error) {
		console.error("Error fetching gas prices:", error)
		return {
			SafeGasPrice: "Error",
			ProposeGasPrice: "Error",
			FastGasPrice: "Error",
			suggestBaseFee: "Error"
		}
	}
}

// get images from local filestore or download them once
async function getImage(image) {
	let fm = FileManager.local()
	let dir = fm.documentsDirectory()
	let path = fm.joinPath(dir, image)
	if (fm.fileExists(path)) {
		return fm.readImage(path)
	} else {
		// download once
		let imageUrl
		switch (image) {
			case 'ethereum':
				imageUrl = "https://cryptologos.cc/logos/ethereum-eth-logo.png"
				break
			default:
				console.log(`Sorry, couldn't find ${image}.`);
		}
		let iconImage = await loadImage(imageUrl)
		fm.writeImage(path, iconImage)
		return iconImage
	}
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
	const req = new Request(imgUrl)
	return await req.loadImage()
}

// end of script

