require 'mongoid'

class Classroom
  include Mongoid::Document

  has_many :groups
  field :groups, :type => Array, :default => []

  field :label, :type => String
end