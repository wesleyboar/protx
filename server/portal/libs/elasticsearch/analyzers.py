"""
.. module: portal.lis.elasticsearch.analyzers
   :synopsis: Elastic Search Analyzers
"""
from __future__ import unicode_literals, absolute_import
import logging
from elasticsearch_dsl import analyzer, token_filter, tokenizer

#pylint: disable=invalid-name
logger = logging.getLogger(__name__)
#pylint: enable=invalid-name

path_analyzer = analyzer('path_analyzer',
                         tokenizer=tokenizer('path_hierarchy'))

file_analyzer = analyzer('file_analyzer',
                         tokenizer=tokenizer('trigram', 'nGram', min_gram=2, max_gram=20),
                         filter='lowercase')

file_query_analyzer = analyzer('file_query_analyzer',
                               tokenizer='whitespace', filter=['lowercase', token_filter('trunc20', 'truncate', length=20)])

file_pattern_analyzer = analyzer('file_ext_analyzer',
                        tokenizer=tokenizer('file_pattern', 'pattern', pattern='\\.'),
                        filter='lowercase')

reverse_file_analyzer = analyzer('file_reverse', 
                        tokenizer=tokenizer('keyword'),
                        filter=['lowercase', 'reverse'])