// Used to populate the select tag for counties
/*
<!--
*   AUTHORS: Martin Pozniak, Calvin Bina
*   Updated: 7/7/16
*   Decription: Visualization website querying WNV data from Google fusion tables and using google maps API
-->
*/
var COUNTIES = ["Cass",
                "Burleigh",
                "Grand Forks",
                "Ward",
                "Williams",
                "Stark",
                "Morton",
                "Stutsman",
                "Richland",
                "Rolette",
                "Ramsey",
                "Barnes",
                "McKenzie",
                "Walsh",
                "Mountrail",
                "McLean",
                "Mercer",
                "Traill",
                "Pembina",
                "Benson",
                "Bottineau",
                "McHenry",
                "Ransom",
                "Dickey",
                "Sioux",
                "Pierce",
                "Dunn",
                "Wells",
                "LaMoure",
                "Sargent",
                "Cavalier",
                "Emmons",
                "Foster",
                "Bowman",
                "Nelson",
                "McIntosh",
                "Hettinger",
                "Renville",
                "Divide",
                "Kidder",
                "Adams",
                "Eddy",
                "Grant",
                "Griggs",
                "Towner",
                "Burke",
                "Steele",
                "Logan",
                "Oliver",
                "Golden Valley",
                "Sheridan",
                "Billings",
                "Slope"
                ];

var COLORS = [ //COLOR GRADIENT FROM GREEN TO RED || Update 6.27.16 WE ARE USING 'testCol' IN THE CODE BECAUSE IT GIVE A MORE DEFINED READING ABOUT LOW/MEDIUM/HIGH RISK | 21 levels
    '#00FF00', //#00ff00
    '#0DF200', //#0DF200
    '#1AE600',
    '#26D900',
    '#33CC00',
    '#40BF00',
    '#4CB200',
    '#59A600',
    '#669900',
    '#738C00',
    '#808000',
    '#8C7300',
    '#996600',
    '#A65900',
    '#B24D00',
    '#BF4000',
    '#CC3300',
    '#D92600',
    '#E61900',
    '#F20D00',
    '#FF0000']

var testCol = 
[
'#00FF00',
'#FFFF00',
'#FF0000'
]

var SPECIES = [
    'Total_Mosquitoes',
    'tfemale',
    'tmale',
    'Anopheles',
    'Aedes',
    'Aedes_vexans',
    'Culex',
    'Culex_Tarsalis',
    'Culex_salinarius',
    'Culiseta',
    'Other' ]


/*==================================THIS IS WHERE I STORE THINGS THAT I MIGHT NEEED LATER======================

#quickCountBox
{
    position: absolute;
    text-align: center;
    top: 315px;
    left:725px;
    height:50px;
    width:50px;
    background: black;
    color:white;
    border: 3px groove white;
}

*/
