require 'mongoid'

class Group
  include Mongoid::Document

  belongs_to :classroom

  has_many :students
  field :students, :type => Array, :default => []


  field :label, :type => String
  field :avatarUrl, :type => String
  field :blogUrl, :type => String
  field :score, :type => Integer, :default => 0
  field :badges, :type => Array, :default => []
end