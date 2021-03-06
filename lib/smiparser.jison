%lex

%%
[ \t\n\r]+			                {/* skip whitespace */}
"--"[^\n\r]*			            {/* skip comments */}

"..."			                    {return 'TRIPLE_DOT';}
".."			                    {return 'DOUBLE_DOT';}
"."				                    {return 'DOT';}
","				                    {return 'COMMA';}
";"				                    {return 'SEMI_COLON';}
"("				                    {return 'LEFT_PAREN';}
")"				                    {return 'RIGHT_PAREN';}
"{"				                    {return 'LEFT_BRACE';}
"}"				                    {return 'RIGHT_BRACE';}
"["				                    {return 'LEFT_BRACKET';}
"]"				                    {return 'RIGHT_BRACKET';}
"-"				                    {return 'MINUS';}
"<"				                    {return 'LESS_THAN';}
"|"				                    {return 'VERTICAL_BAR';}
"::="				                {return 'DEFINITION';}

"DEFINITIONS"		                {return 'DEFINITIONS';}
"EXPLICIT"			                {return 'EXPLICIT';}
"IMPLICIT"			                {return 'IMPLICIT';}
"TAGS"				                {return 'TAGS';}
"BEGIN"				                {return 'BEGIN';}
"END"				                {return 'END';}
"EXPORTS"			                {return 'EXPORTS';}
"IMPORTS"			                {return 'IMPORTS';}
"FROM"				                {return 'FROM';}
"MACRO"				                {return 'MACRO';}

"INTEGER"			                {return 'INTEGER';}
"REAL"				                {return 'REAL';}
"BOOLEAN"			                {return 'BOOLEAN';}
"NULL"				                {return 'NULL';}
"BIT"				                {return 'BIT';}
"OCTET"				                {return 'OCTET';}
"STRING"			                {return 'STRING';}
"ENUMERATED"		                {return 'ENUMERATED';}
"SEQUENCE"			                {return 'SEQUENCE';}
"SET"				                {return 'SET';}
"OF"				                {return 'OF';}
"CHOICE"			                {return 'CHOICE';}
"UNIVERSAL"			                {return 'UNIVERSAL';}
"APPLICATION"		                {return 'APPLICATION';}
"PRIVATE"			                {return 'PRIVATE';}
"ANY"				                {return 'ANY';}
"DEFINED"			                {return 'DEFINED';}
"BY"				                {return 'BY';}
"OBJECTS"			                {return 'OBJECTS';}
"OBJECT-GROUP"		                {return 'OBJECT_GROUP';}
"OBJECT-IDENTITY"	                {return 'OBJECT_IDENTITY';}
"OBJECT-TYPE"		                {return 'OBJECT_TYPE';}
"OBJECT"			                {return 'OBJECT';}
"IDENTIFIER"		                {return 'IDENTIFIER';}
"INCLUDES"			                {return 'INCLUDES';}
"MIN-ACCESS"		                {return 'MIN_ACCESS';}
"MIN"				                {return 'MIN';}
"MAX-ACCESS"		                {return 'MAX_ACCESS';}
"MAX"				                {return 'MAX';}
"SIZE"				                {return 'SIZE';}
"WITH"				                {return 'WITH';}
"COMPONENTS"		                {return 'COMPONENTS';}
"COMPONENT"			                {return 'COMPONENT';}
"PRESENT"			                {return 'PRESENT';}
"ABSENT"			                {return 'ABSENT';}
"OPTIONAL"			                {return 'OPTIONAL';}
"DEFAULT"			                {return 'DEFAULT';}
"TRUE"				                {return 'TRUE';}
"FALSE"				                {return 'FALSE';}
"PLUS-INFINITY"			            {return 'PLUS_INFINITY';}
"MINUS-INFINITY"		            {return 'MINUS_INFINITY';}
"MODULE-IDENTITY"		            {return 'MODULE_IDENTITY';}
"NOTIFICATION-TYPE"		            {return 'NOTIFICATION_TYPE';}
"TRAP-TYPE"			                {return 'TRAP_TYPE';}
"TEXTUAL-CONVENTION"	            {return 'TEXTUAL_CONVENTION';}
"NOTIFICATION-GROUP"	            {return 'NOTIFICATION_GROUP';}
"MODULE-COMPLIANCE"		            {return 'MODULE_COMPLIANCE';}
"AGENT-CAPABILITIES"	            {return 'AGENT_CAPABILITIES';}
"LAST-UPDATED"			            {return 'LAST_UPDATED';}
"ORGANIZATION"			            {return 'ORGANIZATION';}
"CONTACT-INFO"			            {return 'CONTACT_INFO';}
"DESCRIPTION"			            {return 'DESCRIPTION';}
"REVISION"			                {return 'REVISION';}
"STATUS"			                {return 'STATUS';}
"REFERENCE"			                {return 'REFERENCE';}
"SYNTAX"			                {return 'SYNTAX';}
"BITS"				                {return 'BITS';}
"UNITS"				                {return 'UNITS';}
"ACCESS"			                {return 'ACCESS';}
"INDEX"				                {return 'INDEX';}
"AUGMENTS"			                {return 'AUGMENTS';}
"IMPLIED"			                {return 'IMPLIED';}
"DEFVAL"			                {return 'DEFVAL';}
"ENTERPRISE"			            {return 'ENTERPRISE';}
"VARIABLES"			                {return 'VARIABLES';}
"DISPLAY-HINT"			            {return 'DISPLAY_HINT';}
"NOTIFICATIONS"			            {return 'NOTIFICATIONS';}
"MODULE"			                {return 'MODULE';}
"MANDATORY-GROUPS"		            {return 'MANDATORY_GROUPS';}
"GROUP"				                {return 'GROUP';}
"WRITE-SYNTAX"			            {return 'WRITE_SYNTAX';}
"PRODUCT-RELEASE"		            {return 'PRODUCT_RELEASE';}
"SUPPORTS"			                {return 'SUPPORTS';}
"VARIATION"			                {return 'VARIATION';}
"CREATION-REQUIRES"		            {return 'CREATION_REQUIRES';}

'[0-1]*'(B|b)			            {return 'BINARY_STRING';}
"'"[0-9A-Fa-f]*"'"(H|h)		        {return 'HEXADECIMAL_STRING';}
"\""[^"]*"\""			            {return 'QUOTED_STRING';}
[a-zA-Z][a-zA-Z0-9-_]*	            {return 'IDENTIFIER_STRING';}
[0-9]+				                {return 'NUMBER_STRING';}

/lex

%left OBJECT_IDENTIFIER_TYPE
%left DEFINITION

%left EMPTY_DESCR
%left DESCRIPTION

%left EMPTY_DEFVAL
%left DEFVAL

%start module_definition

%%

module_definition 
	: module_identifier DEFINITIONS tag_default DEFINITION BEGIN module_body END 
		{
		    return {
                module_name: $1 || '',
                imports: $6.imports || [],
                definitions: $6.definitions || []
            };
        }
	| module_identifier DEFINITIONS tag_default DEFINITION BEGIN END
		{
		    return {
		        module_identifier: $1,
		        imports: [],
		        definitions: []
            };
        }
	| module_identifier DEFINITIONS DEFINITION BEGIN END 
		{
            return {
                module_identifier: $1 || '',
                imports: [],
                definitions: []
            };
        }
	| module_identifier DEFINITIONS DEFINITION BEGIN module_body END 
		{
            return {
                module_identifier: $1 || '',
                imports: $5.imports || [],
                definitions: $5.definitions || []
            };
        }
	;

module_identifier 
	: IDENTIFIER_STRING
		{ $$ = $1; }
	| IDENTIFIER_STRING object_identifier_value
		{ $$ = $1; }
	;

module_reference 
	: IDENTIFIER_STRING DOT 
	;

tag_default 
	: EXPLICIT TAGS
	| IMPLICIT TAGS
	;

module_body
	: export_list import_list assignment_list
		{ $$ = { imports: $2, definitions: $3 }; }
    | import_list assignment_list
        { $$ = { imports: $1, definitions: $2 }; }
    | export_list assignment_list
        { $$ = { imports: [ ], definitions: $2 }; }
    | assignment_list
        { $$ = { imports: [ ], definitions: $1 }; }
	;

export_list
	: EXPORTS symbol_list SEMI_COLON
	| EXPORTS SEMI_COLON
	;

import_list
	: IMPORTS symbols_from_module_list SEMI_COLON
	    { $$ = $2; }
	;

symbols_from_module_list
	: symbols_from_module
	    { $$ = [ $1 ]; }
	| symbols_from_module_list symbols_from_module
	    { $1.push($2); $$ = $1; }
	;

symbols_from_module
	: symbol_list FROM module_identifier
	    { $$ = { 'module_name': $3, 'object_names': $1 }; }
	;

symbol_list
	: symbol
	    { $$ = [ $1 ]; }
	| symbol_list COMMA symbol
	    { $1.push($3); $$ = $1; }
	;

symbol
	: IDENTIFIER_STRING
	| defined_macro_name
	;

assignment_list
	: assignment
		{ $$ = [ $1 ]; }
	| assignment_list assignment
		{ $1.push($2); $$ = $1; }
	;

assignment
	: macro_definition
		{ $$ = { definition_class: 'macro' }; }
	| macro_definition SEMI_COLON
		{ $$ = { definition_class: 'macro' }; }
	| type_assignment
		{
		    $$ = {
		        definition_class: 'type',
		        descriptor: $1.descriptor,
		        type: $1.type
            };
        }
	| type_assignment SEMI_COLON
		{
		    $$ = {
		        definition_class: 'type',
                descriptor: $1.descriptor,
                type: $1.type
            };
        }
	| value_assignment
		{
		    $$ = {
		        definition_class: 'value',
		        descriptor: $1.descriptor,
		        type: $1.type,
		        value: $1.value
            };
        }
	| value_assignment SEMI_COLON
		{
		    $$ = {
		        definition_class: 'value',
		        descriptor: $1.descriptor,
		        type: $1.type,
		        value: $1.value
            };
        }
	;

macro_definition
	: macro_reference MACRO DEFINITION macro_body
	;

macro_reference
	: IDENTIFIER_STRING
	| defined_macro_name
	;

macro_body
	: BEGIN macro_body_element_list END
	| BEGIN END
	| module_reference macro_reference
	;

macro_body_element_list
    : macro_body_element
    | macro_body_element_list macro_body_element
    ;

macro_body_element
	: LEFT_PAREN
    | RIGHT_PAREN
	| VERTICAL_BAR
	| DEFINITION
	| "INTEGER"
	| "REAL"
	| "BOOLEAN"
	| "NULL"
	| "BIT"
	| "OCTET"
	| "STRING"
	| "OBJECT"
	| "IDENTIFIER"
	| "TYPE"
	| "NOTATION"
	| IDENTIFIER_STRING
	| QUOTED_STRING 
	;

type_assignment
	: IDENTIFIER_STRING DEFINITION type
	    { $$ = { descriptor: $1, type: $3 }; }
	;

type
	: builtin_type
		{
		    var type = {
                type_class: 'builtin',
                builtin_name: $1.builtin_name
		    };

		    if (    type.builtin_name === 'INTEGER' ||
		            type.builtin_name === 'OCTET STRING' ) {
		        type.constraint_list = $1.constraint_list || null;
		        type.constraint_type = $1.constraint_type || null;
		    } else
		    if (    type.builtin_name === 'SEQUENCE OF' ) {

		    }
		}
	| defined_type
	    {
	        $$ = {
	            type_class: 'defined',
	            defined_name: $1.defined_name,
	            module_name: $1.module_name || null,
	            constraint_type: $1.constraint_type || null,
	            constraint_list: $1.constraint_list || null
	        };
	    }
	| defined_macro_type
	    {
	        $$ = {
                type_class: 'macro',
                macro_name: $1.macro_name,
                macro_data: $1.macro_data
	        };
	    }
	;

defined_type
	: module_reference IDENTIFIER_STRING value_or_constraint_list
	    {
	        $$ = {
	            defined_name: $2,
	            module_name: $1,
	            constraint_type: $3.constraint_type,
	            constraint_list: $3.constraint_list
            };
        }
	| module_reference IDENTIFIER_STRING
	    {
	        $$ = {
	            defined_name: $2,
	            module_name: $1
	        };
	    }
	| IDENTIFIER_STRING value_or_constraint_list
	    {
	        $$ = {
	            defined_name: $1,
	            constraint_type: $2.constraint_type,
	            constraint_list: $2.constraint_list
	        };
	    }
	| IDENTIFIER_STRING
	    { $$ = { defined_name: $1 }; }
	;

builtin_type
	: null_type
	    { $$ = { builtin_name: $1 }; }
	| boolean_type
	    { $$ = { builtin_name: $1 }; }
	| real_type
	    { $$ = { builtin_name: $1 }; }
	| integer_type
	    {
	        $$ = {
	            builtin_name: 'INTEGER',
	            constraint_type: $1.constraint_type,
	            constraint_list: $1.constraint_list
            };
        }
	| object_identifier_type
	    %prec OBJECT_IDENTIFIER_TYPE
	| string_type 
	| bit_string_type 
	| bits_type
	| sequence_type 
	| sequence_of_type 
	| set_type 
	| set_of_type 
	| choice_type 
	| enumerated_type 
	| selection_type 
	| tagged_type 
	| any_type 
	;

null_type
	: NULL
	;

boolean_type
	: BOOLEAN
	;

real_type
	: REAL
	;

integer_type
	: INTEGER
	    { $$ = {}; }
	| INTEGER value_or_constraint_list
	    {
	        $$ = {
	            constraint_type: $1.constraint_type,
	            constraint_list: $1.constraint_list
	        };
	    }
	;

object_identifier_type
	: OBJECT IDENTIFIER
	    { $$ = 'OBJECT IDENTIFIER'; }
	;

string_type
	: OCTET STRING
	    { $$ = {}; }
	| OCTET STRING constraint_list_container
	    {
            $$ = {
                constraint_type: $1.constraint_type,
                constraint_list: $1.constraint_list
            };
        }
	;

bit_string_type
	: BIT STRING
	| BIT STRING value_or_constraint_list
	;

bits_type
	: BITS
	| BITS value_or_constraint_list
	;

sequence_type
	: SEQUENCE LEFT_BRACE element_type_list RIGHT_BRACE
	| SEQUENCE LEFT_BRACE RIGHT_BRACE
	;

sequence_of_type
	: SEQUENCE OF type
	| SEQUENCE constraint_list_container OF type
	;

set_type
	: SET LEFT_BRACE element_type_list RIGHT_BRACE
	| SET LEFT_BRACE RIGHT_BRACE
	;

set_of_type
	: SET size_constraint OF type
	| SET OF type
	;

choice_type
	: CHOICE LEFT_BRACE element_type_list RIGHT_BRACE
	;

enumerated_type
	: ENUMERATED named_number_list_container
	;

selection_type
	: IDENTIFIER_STRING LESS_THAN type
	;

tagged_type
	: tag type
	| tag explicit_or_implicit_tag type
	;

tag
	: LEFT_BRACKET NUMBER_STRING RIGHT_BRACKET
	| LEFT_BRACKET class NUMBER_STRING RIGHT_BRACKET
	;

class
	: UNIVERSAL
	| APPLICATION
	| PRIVATE
	;

explicit_or_implicit_tag
	: EXPLICIT
	| IMPLICIT
	;

any_type
	: ANY
	| ANY DEFINED BY IDENTIFIER_STRING
	;

element_type_list
	: element_type
	| element_type_list COMMA element_type
	;

element_type
	: IDENTIFIER_STRING type optional_or_default_element
	| IDENTIFIER_STRING type
	| type optional_or_default_element
	| type
	| IDENTIFIER_STRING COMPONENTS OF type
	| COMPONENTS OF type
	;

optional_or_default_element
	: OPTIONAL
	| DEFAULT value
	| DEFAULT IDENTIFIER_STRING value
	;

value_or_constraint_list
	: named_number_list_container
	| constraint_list_container
	;

named_number_list_container
	: LEFT_BRACE named_number_list RIGHT_BRACE
	;

named_number_list
	: named_number
	| named_number_list COMMA named_number
	;

named_number
	: IDENTIFIER_STRING LEFT_PAREN number RIGHT_PAREN
	;

number
	: MINUS NUMBER_STRING
	| NUMBER_STRING
	| defined_value
	;

constraint_list_container
	: LEFT_PAREN constraint_list RIGHT_PAREN
	;

constraint_list
	: constraint
	| constraint_list VERTICAL_BAR constraint
	;
	
constraint
	: value_constraint
	| size_constraint
	| alphabet_constraint
	| contained_type_constraint
	| inner_type_constraint
	;

value_constraint_list_container
	: LEFT_PAREN value_constraint_list RIGHT_PAREN
	;

value_constraint_list
	: value_constraint
	| value_constraint_list VERTICAL_BAR value_constraint
	;

value_constraint
	: lower_end_point value_range
	| lower_end_point
	;

value_range
	: LESS_THAN DOUBLE_DOT LESS_THAN upper_end_point
	| LESS_THAN DOUBLE_DOT upper_end_point
	| DOUBLE_DOT LESS_THAN upper_end_point
	| DOUBLE_DOT upper_end_point
	;

lower_end_point
	: value
	| MIN
	;

upper_end_point
	: value
	| MAX
	;

size_constraint
	: SIZE value_constraint_list_container
	;

alphabet_constraint
	: FROM value_constraint_list_container
	;

contained_type_constraint
	: INCLUDES type
	;

inner_type_constraint
	: WITH COMPONENT value_or_constraint_list
	| WITH COMPONENTS components_list_container
	;

components_list_container
	: LEFT_BRACE component_constraint_list RIGHT_BRACE
	;

component_constraint_list
	: component_constraint components_list_tail
	| component_constraint
	| TRIPLE_DOT components_list_tail
	;

components_list_tail
	: COMMA component_constraint
	| COMMA component_list_tail COMMA component_constraint
	;

component_constraint
	: IDENTIFIER_STRING component_value_presence
	| IDENTIFIER_STRING
	| component_value_presence
	;

component_value_presence
	: value_or_constraint_list component_presence
	| value_or_constraint_list
	| component_presence
	;

component_presence
	: PRESENT
	| ABSENT
	| OPTIONAL
	;

value_assignment
	: IDENTIFIER_STRING type DEFINITION value
		{ $$ = {descriptor: $1, type: $2, value: $4}; }
    | IDENTIFIER_STRING object_identifier_type DEFINITION object_identifier_value
        {
            $$ = {
                descriptor: $1,
                type: {
                    type_class: 'builtin',
                    builtin_name: 'OBJECT IDENTIFIER'
                },
                value: $4
            };
        }
    | IDENTIFIER_STRING object_identifier_macro_type DEFINITION object_identifier_value
        {
            $$ = {
                type: {
                    type_class: 'macro',
                    macro_name: $2.macro_name,
                    macro_data: $2.macro_data
                },
                descriptor: $1,
                value: $4
            };
        }
    ;

value
	: builtin_value
		{ $$ = $1; }
	| defined_value
		{ $$ = 'not_implemented'; }
	;

defined_value
	: module_reference IDENTIFIER_STRING
    | IDENTIFIER_STRING
	;

builtin_value
	: null_value
		{ $$ = {class: 'null', value: $1}; }
	| boolean_value
		{ $$ = {class: 'boolean', value: $1}; }
	| special_real_value
		{ $$ = {class: 'special_real', value: $1}; }
	| number_value
		{ $$ = {class: 'number', value: $1}; }
	| binary_value
		{ $$ = {class: 'binary', value: $1}; }
	| hexadecimal_value
		{ $$ = {class: 'hexadecimal', value: $1}; }
	| string_value
		{ $$ = {class: 'string', value: $1}; }
	| bit_or_object_identifier_value 
		{ $$ = {class: $1.class, value: $1.value}; }
	;

null_value
	: NULL
		{ $$ = null; }
	;

boolean_value
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;

special_real_value
	: PLUS_INFINITY
		{ $$ = 'plus_infinity'; }
	| MINUS_INFINITY
		{ $$ = 'minus_infinity'; }
	;

number_value
	: MINUS NUMBER_STRING
		{ $$ = -1 * parseInt($2); }
	| NUMBER_STRING
		{ $$ = parseInt($1); }
	;

binary_value
	: BINARY_STRING
		{ $$ = $1; }
	;

hexadecimal_value
	: HEXADECIMAL_STRING
		{ $$ = $1; }
	;

string_value
	: QUOTED_STRING
		{ $$ = $1; }
	;

bit_or_object_identifier_value
	: name_value_list_container
		{ $$ = {class: 'ambiguous_bit_or_object_identifier', value: $1}; }
	;

bit_value
	: name_value_list_container
		{ $$ = {class: 'bit', value: $1}; }
	;

object_identifier_value
	: name_value_list_container
		{ $$ = {class: 'object_identifier', value: $1}; }
	;

name_value_list_container
	: LEFT_BRACE name_value_list RIGHT_BRACE
		{ $$ = $2; }
	| LEFT_BRACE RIGHT_BRACE
		{ $$ = []; }
	;

name_value_list
	: name_or_number
		{ $$ = [ $1 ]; }
	| name_value_list comma_opt name_or_number
		{
			$1.push($3);
			$$ = $1;
		}
	;

comma_opt
	:
	| COMMA
	;

name_or_number
	: NUMBER_STRING
	    { $$ = { id: parseInt($1) }; }
	| IDENTIFIER_STRING
	    { $$ = { de: $1 }; }
	| name_and_number
	    { $$ = $1; }
	;

name_and_number
	: IDENTIFIER_STRING LEFT_PAREN NUMBER_STRING RIGHT_PAREN
	    { $$ = { de: $1, id: parseInt($3) }; }
	| IDENTIFIER_STRING LEFT_PAREN defined_value RIGHT_PAREN
	    { $$ = { de: $1, id: 'not_implemented' }; }
	;

defined_macro_type
	: snmp_trap_type_macro_type
		{ $$ = { macro_name: 'trap_type', macro_data: $1 }; }
	| snmp_textual_convention_macro_type 
		{ $$ = { macro_name: 'textual_convention', macro_data: $1 }; }
	;

object_identifier_macro_type
	: snmp_module_identity_macro_type
		{ $$ = { macro_name: 'module_identity', macro_data: $1 }; }
	| snmp_object_identity_macro_type
		{ $$ = { macro_name: 'object_identity', macro_data: $1 }; }
	| snmp_object_type_macro_type
		{ $$ = { macro_name: 'object_type', macro_data: $1 }; }
	| snmp_notification_type_macro_type
		{ $$ = { macro_name: 'notification_type', macro_data: $1 }; }
	| snmp_object_group_macro_type
		{ $$ = { macro_name: 'object_group', macro_data: $1 }; }
	| snmp_notification_group_macro_type
		{ $$ = { macro_name: 'notification_group', macro_data: $1 }; }
	| snmp_module_compliance_macro_type
		{ $$ = { macro_name: 'module_compliance', macro_data: $1 }; }
	| snmp_agent_capabilities_macro_type
		{ $$ = { macro_name: 'agent_capabilities', macro_data: $1 }; }
	;

defined_macro_name
	: MODULE_IDENTITY 
	| OBJECT_IDENTITY 
	| OBJECT_TYPE 
	| NOTIFICATION_TYPE 
	| TRAP_TYPE 
	| TEXTUAL_CONVENTION 
	| OBJECT_GROUP 
	| NOTIFICATION_GROUP 
	| MODULE_COMPLIANCE 
	| AGENT_CAPABILITIES 
	;

snmp_module_identity_macro_type
	: MODULE_IDENTITY 
		snmp_update_part 
		snmp_organization_part 
		snmp_contact_part 
		snmp_descr_part 
		snmp_revision_part_list_opt
        {
            $$ = {
                update: $2,
                organization: $3,
                contact: $4,
                description: $5,
                revisions: $6
            };
        }
    ;

snmp_revision_part_list_opt
    : snmp_revision_part_list
        { $$ = $1; }
    |
        { $$ = []; }
    ;

snmp_revision_part_list
	: snmp_revision_part
	    { $$ = [ $1 ]; }
	| snmp_revision_part_list snmp_revision_part
	    { $1.push($2); $$ = $1; }
	;

snmp_object_identity_macro_type
	: OBJECT_IDENTITY
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
        {
            $$ = {
                status: $2,
                description: $3,
                reference: $4
            };
        }
	;

snmp_object_type_macro_type
	: OBJECT_TYPE
		snmp_syntax_part
		snmp_units_part_opt
		snmp_access_part
		snmp_status_part
		snmp_descr_part_opt
		snmp_refer_part_opt
		snmp_index_part_opt
		snmp_def_val_part_opt	
        {
            $$ = {
                syntax: $2,
                units: $3,
                access: $4,
                status: $5,
                description: $6,
                reference: $7,
                index: $8,
                default_value: $9
            };
        }
	;

snmp_notification_type_macro_type
	: NOTIFICATION_TYPE
		snmp_objects_part_opt
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
        {
            $$ = {
                objects: $2,
                status: $3,
                description: $4,
                reference: $5
            };
        }
	;

snmp_trap_type_macro_type
	: TRAP_TYPE
		snmp_enterprise_part
		snmp_var_part_opt
		snmp_descr_part_opt
		snmp_refer_part_opt
		{
		    $$ = {
		        enterprise: $2,
		        variables: $3,
		        description: $4,
		        reference: $5
            };
		}
	;

snmp_textual_convention_macro_type
	: TEXTUAL_CONVENTION
		snmp_display_part_opt
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_syntax_part
        {
            $$ = {
                display_hint: $2,
                status: $3,
                description: $4,
                reference: $5,
                syntax: $6
            };
        }
	;

snmp_object_group_macro_type
	: OBJECT_GROUP
		snmp_objects_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
        {
            $$ = {
                objects: $2,
                status: $3,
                description: $4,
                reference: $5
            };
        }
	;

snmp_notification_group_macro_type
	: NOTIFICATION_GROUP
		snmp_notifications_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
        {
            $$ = {
                notifications: $1,
                status: $2,
                description: $3,
                reference: $4
            };
        }
	;

snmp_module_compliance_macro_type
	: MODULE_COMPLIANCE
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_module_part_list
        {
            $$ = {
                status: $2,
                description: $3,
                reference: $4,
                modules: $5
            };
        }
	;

snmp_agent_capabilities_macro_type
	: AGENT_CAPABILITIES
		snmp_product_release_part
		snmp_status_part
		snmp_descr_part
		snmp_refer_part_opt
		snmp_module_support_part_list_opt
        {
            $$ = {
                product_release: $2,
                status: $3,
                description: $4,
                supports: $5
            };
        }
    ;

snmp_update_part
	: LAST_UPDATED QUOTED_STRING
	    { $$ = $2; }
	;

snmp_organization_part
	: ORGANIZATION QUOTED_STRING
	    { $$ = $2; }
	;

snmp_contact_part
	: CONTACT_INFO QUOTED_STRING
	    { $$ = $2; }
	;

snmp_descr_part
	: DESCRIPTION QUOTED_STRING
		{ $$ = $2; }
	;

snmp_descr_part_opt
	:
	    %prec EMPTY_DESCR
		{ $$ = ""; }
	| DESCRIPTION QUOTED_STRING
		{ $$ = $2; }
	;

snmp_revision_part
	: REVISION QUOTED_STRING
		DESCRIPTION QUOTED_STRING
		{ $$ = { revision: $2, description: $4 }; }
	;

snmp_status_part
	: STATUS IDENTIFIER_STRING
		{ $$ = $2; }
	;

snmp_refer_part
	: REFERENCE QUOTED_STRING
		{ $$ = $2; }
	;

snmp_refer_part_opt
	:
		{ $$ = ""; }
	| REFERENCE QUOTED_STRING 
		{ $$ = $2; }
	;

snmp_syntax_part
	: SYNTAX type
		{ $$ = $2; }
	;

snmp_syntax_part_opt
	:
		{ $$ = null; }
	| SYNTAX type
		{ $$ = $2; }
	;

snmp_units_part
	: UNITS QUOTED_STRING
		{ $$ = $2; }
	;

snmp_units_part_opt
	:
		{ $$ = ""; }
	| UNITS QUOTED_STRING
		{ $$ = $2; }
	;

snmp_access_part
	: ACCESS IDENTIFIER_STRING
        { $$ = { access_type: 'access', access_level: $2 }; }
    | MAX_ACCESS IDENTIFIER_STRING
        { $$ = { access_type: 'max_access', access_level: $2 }; }
    | MIN_ACCESS IDENTIFIER_STRING
        { $$ = { access_type: 'min_access', access_level: $2 }; }
    ;

snmp_access_part_opt
	:
		{ $$ = null; }
	| ACCESS IDENTIFIER_STRING
		{ $$ = { access_type: 'access', access_level: $2 }; }
	| MAX_ACCESS IDENTIFIER_STRING
		{ $$ = { access_type: 'max_access', access_level: $2 }; }
	| MIN_ACCESS IDENTIFIER_STRING
		{ $$ = { access_type: 'min_access', access_level: $2 }; }
	;

snmp_index_part
	: INDEX LEFT_BRACE index_value_list RIGHT_BRACE
		{ $$ = { part_type: 'index', value: $3 }; }
	| AUGMENTS LEFT_BRACE value RIGHT_BRACE
		{ $$ = { part_type: 'augments', value: $3 }; }
	;

snmp_index_part_opt
	:
		{ $$ = null; }
	| INDEX LEFT_BRACE index_value_list RIGHT_BRACE
		{ $$ = { part_type: 'index', value: $3 }; }
	| AUGMENTS LEFT_BRACE value RIGHT_BRACE
		{ $$ = { part_type: 'augments', value: $3 }; }
	;

index_value_list
	: index_value
		{ $$ = [ $1 ]; }
	| index_value_list COMMA index_value
		{ $1.push($3); $$ = $1; }
	;

index_value
	: value
		{ $$ = 'not_implemented'; }
	| IMPLIED value
		{ $$ = 'not_implemented'; }
	| index_type
		{ $$ = $1; }
	;

index_type
	: integer_type
		{ $$ = $1; }
	| string_type
		{ $$ = $1; }
	| object_identifier_type
		{ $$ = $1; }
	;

snmp_def_val_part
	: DEFVAL LEFT_BRACE value RIGHT_BRACE
		{ $$ = $1; }
	;

snmp_def_val_part_opt
	:
	    %prec EMPTY_DEFVAL
		{ $$ = null; }
	| DEFVAL LEFT_BRACE value RIGHT_BRACE
		{ $$ = $3; }
	;

snmp_objects_part
	: OBJECTS LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;

snmp_objects_part_opt
	:
	    { $$ = [ ]; }
	| OBJECTS LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;

/*
 * non-identifiers are ignored, per snmptranslate behavior.
 */
identifier_or_value_list
    : identifier_or_value
        { $$ = $1 ? [ $1 ] : [ ]; }
    | identifier_or_value_list COMMA identifier_or_value
        { $3 && $1.push($3); $$ = $1; }
    ;

//TODO: add module reference value
identifier_or_value
    : IDENTIFIER_STRING
        { $$ = $1; }
    | builtin_value
        { $$ = null; }
    ;

snmp_enterprise_part
	: ENTERPRISE value
	    { $$ = $2; }
	;

snmp_var_part
	: VARIABLES LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;

snmp_var_part_opt
	:
	    { $$ = [ ]; }
	| VARIABLES LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;

snmp_display_part
	: DISPLAY_HINT QUOTED_STRING
	    { $$ = $2; }
	;

snmp_display_part_opt
	:
	    { $$ = ""; }
	| DISPLAY_HINT QUOTED_STRING
	    { $$ = $2; }
	;

snmp_notifications_part
	: NOTIFICATIONS LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $2; }
	;

snmp_module_part_list
	: snmp_module_part
	    { $$ = [ $1 ]; }
	| snmp_module_part_list snmp_module_part
	    { $1.push($2); $$ = $1; }
	;

snmp_module_part
	: MODULE snmp_module_import_opt	
		snmp_mandatory_part_opt
		snmp_compliance_part_list_opt
		{
		    $$ = {
		        module_identifier: $2,
		        mandatory_groups: $3,
		        compliances: $4
		    };
		}
    ;

snmp_module_import
	: module_identifier
	    { $$ = $1; }
	;

snmp_module_import_opt
	:
	    %prec EMPTY_MODULE_IMPORT
        { $$ = null; }
	| module_identifier
	    { $$ = $1; }
	;

snmp_mandatory_part_opt
	:
	    { $$ = [ ]; }
	| MANDATORY_GROUPS LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;

snmp_compliance_part_list_opt
    :
        { $$ = [ ]; }
	| snmp_compliance_part_list
	    { $$ = $1; }
	;

snmp_compliance_part_list
	: snmp_compliance_part
	    { $$ = [ $1 ]; }
	| snmp_compliance_part_list snmp_compliance_part
	    { $1.push($2); $$ = $1; }
    ;

snmp_compliance_part
	: compliance_group
	    { $$ = { compliance_class: 'group', compliance: $1 }; }
	| compliance_object
	    { $$ = { compliance_class: 'object', compliance: $1 }; }
	;

compliance_group
	: GROUP identifier_or_value
		snmp_descr_part
		{ $$ = { descriptor: $2, description: $3 }; }
	;

compliance_object
	: OBJECT identifier_or_value
		snmp_syntax_part_opt
		snmp_write_syntax_part_opt
		snmp_access_part_opt
		snmp_descr_part
        {
            $$ = {
                descriptor: $2,
                syntax: $3,
                write_syntax: $4,
                access: $5,
                description: $6
            };
        }
	;

snmp_write_syntax_part_opt
	:
	    { $$ = null; }
	| WRITE_SYNTAX type
	    { $$ = $2; }
	;

snmp_product_release_part_opt
	:
	    { $$ = ""; }
	| PRODUCT_RELEASE QUOTED_STRING
	    { $$ = $2; }
	;

snmp_module_support_part_list_opt
    :
        { $$ = [ ]; }
    | snmp_module_support_part_list
        { $$ = $1; }
    ;

snmp_module_support_part_list
	: snmp_module_support_part
	    { $$ = [ $1 ]; }
	| snmp_module_support_part_list snmp_module_support_part
	    { $1.push($2); $$ = $1; }
	;

snmp_module_support_part
	: SUPPORTS snmp_module_import
		INCLUDES LEFT_BRACE identifier_or_value_list RIGHT_BRACE
		snmp_variation_part_list_opt
        {
            $$ = {
                module_name: $2,
                includes: $3,
                variations: $4
            };
        }
	;

snmp_variation_part_list_opt
    :
        { $$ = [ ]; }
	| snmp_variation_part
	    { $$ = [ $1 ]; }
	| snmp_variation_part_list snmp_variation_part
	    { $1.push($2); $$ = $1; }
	;

snmp_variation_part
	: VARIATION IDENTIFIER_STRING
		snmp_syntax_part_opt
		snmp_write_syntax_part_opt
		snmp_access_part_opt
		snmp_creation_part_opt
		snmp_def_val_part_opt
		snmp_descr_part
		{
		    $$ = {
		        descriptor: $2,
		        syntax: $3,
		        write_syntax: $4,
		        access: $5,
		        creation: $6,
		        default_value: $7,
		        description: $8
		    };
		}
	;

snmp_creation_part_opt
	:
	    { $$ = [ ]; }
	| CREATION_REQUIRES LEFT_BRACE identifier_or_value_list RIGHT_BRACE
	    { $$ = $3; }
	;
