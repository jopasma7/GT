/*
 * Script Name: Fast Notes
 * Version: v5.1
 * Last Updated: 2021-06-07
 * Edited By: Rabagalan73
 */

var scriptData = {
	name: 'Fast Notes',
	version: 'v5.1',
    editor: 'Rabagalan73',
};

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Globals
var allowedScreens = ['report', 'info_command'];

// Translations
var translations = {
	en_DK: {
		'Title': 'Set/Get Village Notes',
		'Help': 'Help',
		'Added': 'Note added!',
		'CantAdded': 'Note can not be added for this report!',
		'Link': 'Report Link',
		'BadUsage': 'This script can be run only on single Report view or while tagging an Incoming!',
		'NoNotes': 'No notes found for this village!',
		'NeedPremium': 'This script requires Premium Account to be active!',
	},
	en_US: {
		'Title': 'Set/Get Village Notes',
		'Help': 'Help',
		'Added': 'Note added!',
		'CantAdded': 'Note can not be added for this report!',
		'Link': 'Report Link',
		'BadUsage': 'This script can be run only on single Report view or while tagging an Incoming!',
		'NoNotes': 'No notes found for this village!',
		'NeedPremium': 'This script requires Premium Account to be active!',
	},
    es_ES: {
		'Title': 'Establece notas rápidas',
		'Help': 'Ayuda',
		'Added': 'Has añadido la nota correctamente.',
		'CantAdded': 'No puedes agregar este informe a una nota rápida.',
		'Link': 'Enlace al Informe',
		'BadUsage': 'Este script se ejecuta desde un informe.',
		'NoNotes': 'No se ha encontrado ninguna nota para este pueblo.',
		'NeedPremium': 'Para ejecutar este Script necesitas una cuenta Premium.',
	},
};

win = window;
win.FastNotes ={
	table: null,
	tableSpy: null,
	outsideOFF: 0,
	insideOFF: 0,
	outsideDEFF: 0,
	totalDEFF: 0,
	totalOFF: 0
}

// Init Debug
initDebug();

// Init Set Village Notes
function initSetVillageNote() {
	let noteText = '';
	let villageId;

	var typeVillage = "";    

	if(document.getElementById("attack_spy_away") != null){
		win.FastNotes.tableSpy = document.getElementById("attack_spy_away").getElementsByClassName("vis")[0];
	}
	win.FastNotes.table = $('table#attack_info_def_units')[0];

	const defenderPlayerName = $('table#attack_info_def')[0].rows[0].cells[1].textContent;

	if (defenderPlayerName !== '---') {
		// Prepare note data
		if (defenderPlayerName == game_data.player.name) {
			villageId = $('table#attack_info_att')[0]
				.rows[1].cells[1].getElementsByTagName('span')[0]
				.getAttribute('data-id');
		} else {
			villageId = $('table#attack_info_def')[0]
				.rows[1].cells[1].getElementsByTagName('span')[0]
				.getAttribute('data-id');
		}

		UI.ErrorMessage('Script must be run from <a href="/game.php?screen=overview_villages&mode=units" class="btn">Troops Overview</a>', 5000);
		
		calc();

	// Unidades de viaje
	if(win.FastNotes.tableSpy != null){

		calcSpyTable();		

		if(win.FastNotes.outsideOFF > 200 && win.FastNotes.outsideDEFF > 200) typeVillage="~ Posible Mixto";
		else if(win.FastNotes.outsideOFF > 400) typeVillage="~ Posible Ofensivo";
		else if(win.FastNotes.insideOFF > 400 && win.FastNotes.totalDEFF > 400) typeVillage="~ Posible Mixto o Apoyos";
		else if(win.FastNotes.insideOFF > 400) typeVillage="~ Posible Ofensivo";
		else if(win.FastNotes.outsideDEFF > 400) typeVillage="~ Posible Defensivo";
		else if(win.FastNotes.totalDEFF > win.FastNotes.totalOFF) typeVillage="~ Posible Defensivo";
		else if(win.FastNotes.totalOFF > win.FastNotes.totalDEFF) typeVillage="~ Posible Ofensivo";
		else if(win.FastNotes.totalOFF == 0 && win.FastNotes.totalDEFF == 0) typeVillage="~ Pueblo Vacío";
		else typeVillage="~ Imposible Identificar"

	// Unidades de en casa
	}else{

		if(win.FastNotes.insideOFF > 400 && win.FastNotes.totalDEFF > 400) typeVillage="~ Posible Mixto o Apoyos";
		else if(win.FastNotes.insideOFF > 400) typeVillage="~ Posible Ofensivo";
		else if(win.FastNotes.totalDEFF > win.FastNotes.totalOFF) typeVillage="~ Posible Defensivo";
		else if(win.FastNotes.totalOFF > win.FastNotes.totalDEFF) typeVillage="~ Posible Ofensivo";
		else if(win.FastNotes.totalOFF == 0 && win.FastNotes.totalDEFF == 0) typeVillage="~ Pueblo Vacío";
		else typeVillage="~ Imposible Identificar"
		
	}

		noteText = '[b]Dueño: [/b][player]' + defenderPlayerName + '[/player]';
		noteText += '\n [b]Tipo: [/b]' + typeVillage;
		noteText += '\n' + $('#report_export_code')[0].innerHTML;

		// Add note on village
		TribalWars.post(
			'info_village',
			{
				ajaxaction: 'edit_notes',
				id: villageId,
			},
			{
				note: noteText,
			},
			function () {
				UI.SuccessMessage(tt('Added'), 2000);
			}
		);
	} else {
		UI.ErrorMessage(tt('CantAdded'), 2000);
	}
}

function calc() {
	for (var i = 0, row; row = win.FastNotes.table.rows[i]; i++) {
        if(i == 1){
            for (var j = 0, colum; colum = row.cells[j]; j++) {
				// DEFF : 1-2-6
				if(j == 1 || j == 2 || j == 6) {
					win.FastNotes.totalDEFF += parseInt(row.cells[j].textContent, 10);
				// OFF : 3-5-7
				}else if(j == 3 || j == 5 || j == 7) {
					win.FastNotes.insideOFF += parseInt(row.cells[j].textContent, 10);
					win.FastNotes.totalOFF += parseInt(row.cells[j].textContent, 10);
				}
            }
        }           
    }
}

function calcSpyTable(){
	for (var i = 0, row; row = win.FastNotes.tableSpy.rows[i]; i++) {
		if(i == 1){
			for (var j = 0, colum; colum = row.cells[j]; j++) {
				// DEFF : 0-1-5
				if(j == 0 || j == 1 || j == 5) {
					win.FastNotes.outsideDEFF += parseInt(row.cells[j].textContent, 10);
					win.FastNotes.totalDEFF += parseInt(row.cells[j].textContent, 10);
				// OFF : 2-4-6
				}else if(j == 2 || j == 4 || j == 6) {
					win.FastNotes.outsideOFF += parseInt(row.cells[j].textContent, 10);
					win.FastNotes.totalOFF += parseInt(row.cells[j].textContent, 10);
				}
			}
		}           
	}	
}

// Init Get Village Notes
function initGetVillageNote() {
	$.get($('.village_anchor').first().find('a').first().attr('href'), function (html) {
		const note = jQuery(html).find('#own_village_note .village-note');
		if (note.length > 0) {
			const noteContent = `
                <div id="ra-village-notes" class="vis">
                    <div class="ra-village-notes-header">
                        <h3>${tt(scriptData.name)}</h3>
                    </div>
                    <div class="ra-village-notes-body">
                        ${note[0].children[1].innerHTML}
                    </div>
                    <div class="ra-village-notes-footer">
                        <small>
                            <strong>
                                ${tt(scriptData.name)} ${scriptData.version}
                            </strong> -
                            <a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">
                                ${scriptData.author}
                            </a> -
                            <a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">
                                ${tt('Help')}
                            </a>
                        </small>
                    </div>
                </div>
                <style>
                    #ra-village-notes { position: relative; display: block; width: 100%; height: auto; clear: both; margin: 15px auto; padding: 10px; box-sizing: border-box; }
                    .ra-village-notes-footer { margin-top: 15px; }
                </style>
            `;
			jQuery('#content_value table:eq(0)').after(noteContent);
		}
	});
}

// Helper: Get parameter by name
function getParameterByName(name, url = window.location.href) {
	return new URL(url).searchParams.get(name);
}

// Helper: Generates script info
function scriptInfo() {
	return `[${scriptData.name} ${scriptData.version}]`;
}

// Helper: Prints universal debug information
function initDebug() {
	console.debug(`${scriptInfo()} It works ðŸš€!`);
	if (DEBUG) {
		console.debug(`${scriptInfo()} World:`, game_data.world);
		console.debug(`${scriptInfo()} Screen:`, game_data.screen);
		console.debug(`${scriptInfo()} Game Version:`, game_data.majorVersion);
		console.debug(`${scriptInfo()} Game Build:`, game_data.version);
		console.debug(`${scriptInfo()} Locale:`, game_data.locale);
		console.debug(`${scriptInfo()} Premium:`, game_data.features.Premium.active);
	}
}

// Helper: Text Translator
function tt(string) {
	var gameLocale = game_data.locale;

	if (translations[gameLocale] !== undefined) {
		return translations[gameLocale][string];
	} else {
		return translations['es_ES'][string];
	}
}

(function () {
	const gameScreen = getParameterByName('screen');
	const gameView = getParameterByName('view');
	const commandId = getParameterByName('id');

	if (game_data.features.Premium.active) {
		if (allowedScreens.includes(gameScreen)) {
			if (gameScreen === 'report' && gameView !== null) {
				initSetVillageNote();
			} else if (gameScreen === 'info_command' && commandId !== null) {
				initGetVillageNote();
			} else {
				UI.ErrorMessage(
					tt('BadUsage'),
					2000
				);
			}
		} else {
			UI.ErrorMessage(
				tt('BadUsage'),
				2000
			);
		}
	} else {
		UI.ErrorMessage(tt('NeedPremium'));
	}
})();